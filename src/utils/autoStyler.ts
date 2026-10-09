import {
  PhotoAtmosphereConfig,
  SpatialRouteConfig,
  HudCardConfig,
  ElevationOverlayConfig,
  StravaActivityData,
} from '../types/poster';
import { chooseAutoRoutePlacement, NormalizedRect, toRoutePlacement } from './autoPlacement';

export interface AutoStyleResult {
  atmosphere: Partial<PhotoAtmosphereConfig>;
  spatialRoute: Partial<SpatialRouteConfig>;
  hudCard: Partial<HudCardConfig>;
  elevationConfig?: Partial<ElevationOverlayConfig>;
  summary: {
    mood: string;
    paletteDescription: string;
    routeColorName: string;
    accentHex: string;
    source: 'vision_heuristic' | 'gemini_vision';
  };
  layoutEngine?: any;
}

interface ImageStats {
  avgBrightness: number; // 0 to 255
  avgWarmth: number; // -1 to 1 (R vs B)
  avgGreenness: number; // -1 to 1 (G vs R+B)
  avgSaturation: number; // 0 to 1
  contrastRatio: number; // std deviation
  topLeftVariance: number;
  topRightVariance: number;
  bottomLeftVariance: number;
  leftHalfComplexity: number; // Subject mass detection
  rightHalfComplexity: number; // Subject mass detection
  topHalfComplexity: number; // Sky / open air detection
  bottomHalfComplexity: number; // Lower foreground / face / body detection
  complexityGrid: number[];
  dominantHue: string;
  vibrantAccent: { hex: string; name: string };
  groundTone: 'dark_tarmac' | 'bright_sand' | 'green_trail' | 'neutral_gray';
}

/**
 * Analyzes photo pixel data on an offscreen canvas to compute color mood,
 * lighting characteristics, and optimal HUD placement.
 */
function analyzeImageCanvas(img: HTMLImageElement): ImageStats {
  const canvas = document.createElement('canvas');
  const sampleWidth = 80;
  const aspect = img.naturalWidth / (img.naturalHeight || 1);
  const sampleHeight = Math.max(1, Math.round(sampleWidth / aspect));
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      avgBrightness: 128,
      avgWarmth: 0,
      avgGreenness: 0,
      avgSaturation: 0.3,
      contrastRatio: 30,
      topLeftVariance: 20,
      topRightVariance: 20,
      bottomLeftVariance: 20,
      leftHalfComplexity: 15,
      rightHalfComplexity: 25,
      topHalfComplexity: 10,
      bottomHalfComplexity: 35,
      complexityGrid: Array(16).fill(30),
      dominantHue: 'neutral',
      vibrantAccent: { hex: '#FC5200', name: 'Strava Racing Orange' },
      groundTone: 'neutral_gray',
    };
  }

  ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
  const imgData = ctx.getImageData(0, 0, size, size).data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalSat = 0;
  let totalLuminance = 0;

  const luminances: number[] = [];

  // Corner quadrant samples for negative space detection
  const topLeftLums: number[] = [];
  const topRightLums: number[] = [];
  const bottomLeftLums: number[] = [];
  const leftHalfLums: number[] = [];
  const rightHalfLums: number[] = [];
  const topHalfLums: number[] = [];
  const bottomHalfLums: number[] = [];
  const regionalLuminances: number[][] = Array.from({ length: 16 }, () => []);

  // Color buckets for accent detection
  const colorBuckets = {
    orange: 0,
    cyan: 0,
    gold: 0,
    lime: 0,
    pink: 0,
    white: 0,
  };

  const totalPixels = sampleWidth * sampleHeight;

  for (let y = 0; y < sampleHeight; y++) {
    for (let x = 0; x < sampleWidth; x++) {
      const idx = (y * sampleWidth + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];

      totalR += r;
      totalG += g;
      totalB += b;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;
      luminances.push(lum);
      const regionX = Math.min(3, Math.floor((x / sampleWidth) * 4));
      const regionY = Math.min(3, Math.floor((y / sampleHeight) * 4));
      regionalLuminances[regionY * 4 + regionX].push(lum);

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max > 0 ? (max - min) / max : 0;
      totalSat += sat;

      // Track left vs right visual mass (detecting athlete side)
      if (x < size * 0.5) {
        leftHalfLums.push(lum);
      } else {
        rightHalfLums.push(lum);
      }

      // Track top vs bottom visual mass (detecting selfie/portrait lower-body occupation)
      if (y < sampleHeight * 0.45) {
        topHalfLums.push(lum);
      } else {
        bottomHalfLums.push(lum);
      }

      // Track corner luminance distributions
      if (x < sampleWidth * 0.4 && y < sampleHeight * 0.4) topLeftLums.push(lum);
      if (x > sampleWidth * 0.6 && y < sampleHeight * 0.4) topRightLums.push(lum);
      if (x < sampleWidth * 0.4 && y > sampleHeight * 0.6) bottomLeftLums.push(lum);

      // Check for saturated accent color hits
      if (sat > 0.45 && lum > 40 && lum < 220) {
        if (r > 160 && g > 60 && g < 180 && b < 100) colorBuckets.orange++;
        else if (b > 150 && g > 130 && r < 120) colorBuckets.cyan++;
        else if (r > 170 && g > 150 && b < 100) colorBuckets.gold++;
        else if (g > 150 && r < 160 && b < 130) colorBuckets.lime++;
        else if (r > 170 && b > 140 && g < 130) colorBuckets.pink++;
      } else if (lum > 225 && sat < 0.15) {
        colorBuckets.white++;
      }
    }
  }

  const avgR = totalR / totalPixels;
  const avgG = totalG / totalPixels;
  const avgB = totalB / totalPixels;
  const avgBrightness = totalLuminance / totalPixels;
  const avgSaturation = totalSat / totalPixels;

  const avgWarmth = (avgR - avgB) / 255;
  const avgGreenness = (avgG - (avgR + avgB) / 2) / 255;

  const variance = (nums: number[]) => {
    if (nums.length === 0) return 0;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.sqrt(
      nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / nums.length
    );
  };

  const contrastRatio = variance(luminances);
  const topLeftVariance = variance(topLeftLums);
  const topRightVariance = variance(topRightLums);
  const bottomLeftVariance = variance(bottomLeftLums);
  const leftHalfComplexity = variance(leftHalfLums);
  const rightHalfComplexity = variance(rightHalfLums);
  const topHalfComplexity = variance(topHalfLums);
  const bottomHalfComplexity = variance(bottomHalfLums);
  const complexityGrid = regionalLuminances.map(variance);

  // Ground tone analysis (lower 30% of pixels)
  let groundLumSum = 0;
  let groundCount = 0;
  for (let y = Math.floor(sampleHeight * 0.7); y < sampleHeight; y++) {
    for (let x = 0; x < sampleWidth; x++) {
      const idx = (y * sampleWidth + x) * 4;
      groundLumSum += 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
      groundCount++;
    }
  }
  const avgGroundLum = groundCount > 0 ? groundLumSum / groundCount : 100;

  let groundTone: ImageStats['groundTone'] = 'neutral_gray';
  if (avgGreenness > 0.08) {
    groundTone = 'green_trail';
  } else if (avgGroundLum < 85) {
    groundTone = 'dark_tarmac';
  } else if (avgGroundLum > 170) {
    groundTone = 'bright_sand';
  }

  // Determine dominant hue
  let dominantHue = 'neutral';
  if (avgWarmth > 0.09) dominantHue = 'warm_golden';
  else if (avgWarmth < -0.06) dominantHue = 'cool_twilight';
  else if (avgGreenness > 0.06) dominantHue = 'forest_green';

  // Determine vibrant accent candidate
  let vibrantAccent = { hex: '#FC5200', name: 'Strava Racing Orange' };
  const maxBucket = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1])[0];

  if (maxBucket && maxBucket[1] > 40) {
    switch (maxBucket[0]) {
      case 'cyan':
        vibrantAccent = { hex: '#00F2FE', name: 'Electric Cyan' };
        break;
      case 'gold':
        vibrantAccent = { hex: '#FBBF24', name: 'Solar Gold' };
        break;
      case 'lime':
        vibrantAccent = { hex: '#10B981', name: 'Hyper Emerald' };
        break;
      case 'pink':
        vibrantAccent = { hex: '#F43F5E', name: 'Neon Coral' };
        break;
      case 'orange':
      default:
        vibrantAccent = { hex: '#FC5200', name: 'Strava Racing Orange' };
        break;
    }
  }

  return {
    avgBrightness,
    avgWarmth,
    avgGreenness,
    avgSaturation,
    contrastRatio,
    topLeftVariance,
    topRightVariance,
    bottomLeftVariance,
    leftHalfComplexity,
    rightHalfComplexity,
    topHalfComplexity,
    bottomHalfComplexity,
    complexityGrid,
    dominantHue,
    vibrantAccent,
    groundTone,
  };
}

/**
 * Heuristic auto-style engine that derives optimal atmosphere,
 * route styling, and HUD placement from the photo's visual statistics.
 */
function deriveStyleFromStats(
  stats: ImageStats,
  aspect: number,
  activity?: StravaActivityData
): AutoStyleResult {
  const atmosphere: Partial<PhotoAtmosphereConfig> = {};
  const spatialRoute: Partial<SpatialRouteConfig> = {};
  const hudCard: Partial<HudCardConfig> = {};

  let mood = 'High-Contrast Daylight';
  let paletteDescription = 'Crisp neutral daylight with bold editorial contrast';
  let routeColorName = 'Strava Racing Orange';
  let accentHex = '#FC5200';

  // 1. ATMOSPHERE & COLOR GRADING: Keep photo 100% natural, crisp, and authentic
  atmosphere.grade = 'original';
  atmosphere.brightness = 1.0;
  atmosphere.contrast = 1.04;
  atmosphere.warmth = 0;

  if (stats.dominantHue === 'warm_golden' || stats.avgWarmth > 0.08) {
    mood = 'Golden Hour Warmth';
    paletteDescription = 'Natural daylight with signature finish line pop';
    accentHex = '#FC5200';
    routeColorName = 'Strava Racing Orange';
    spatialRoute.renderMode = 'volumetric_tube';
    spatialRoute.tubeSpecular = true;
    hudCard.style = 'smoked_glass';
  } else if (stats.dominantHue === 'cool_twilight' || stats.avgWarmth < -0.06) {
    mood = 'Nordic Mountain Cool';
    paletteDescription = 'Crisp mountain daylight with neon coral contrast';
    accentHex = '#F43F5E';
    routeColorName = 'Neon Coral';
    spatialRoute.renderMode = 'volumetric_tube';
    hudCard.style = 'smoked_glass';
  } else if (stats.dominantHue === 'forest_green' || stats.groundTone === 'green_trail') {
    mood = 'Alpine Trail & Forest';
    paletteDescription = 'Natural forest scenery with vibrant telemetry contrast';
    accentHex = '#FBBF24';
    routeColorName = 'Solar Summit Gold';
    spatialRoute.renderMode = 'volumetric_tube';
    spatialRoute.tubeSpecular = true;
    hudCard.style = 'smoked_glass';
  } else {
    mood = 'High-Definition Asphalt';
    paletteDescription = 'Crisp natural photo with iconic race telemetry';
    accentHex = stats.vibrantAccent.hex || '#FC5200';
    routeColorName = stats.vibrantAccent.name || 'Strava Racing Orange';
    spatialRoute.renderMode = 'volumetric_tube';
    spatialRoute.shadowIntensity = 0.65;
    hudCard.style = 'smoked_glass';
  }

  // 2. INTELLIGENT FACE, ELEVATION & NEGATIVE SPACE DOCKING
  // Provide subtle 14° 3D tilt with soft drop shadow so it looks like a tactile dimensional sculpture
  spatialRoute.glowColor = accentHex;
  spatialRoute.glowEnabled = true;
  spatialRoute.shadowEnabled = true;
  spatialRoute.shadowIntensity = 0.70;
  spatialRoute.shadowOffsetY = 6;
  spatialRoute.lineWidth = 2.8;
  spatialRoute.tiltAngle = 14; // Subtle 3D ground angle
  spatialRoute.yawAngle = 0; // 100% authentic compass heading

  // Detect if the lower portion of the frame is occupied by people/faces (e.g. selfies, portraits)
  const isLowerHalfOccupied =
    stats.bottomHalfComplexity > stats.topHalfComplexity * 1.05 ||
    (stats.topLeftVariance < 25 && stats.bottomLeftVariance > 25);

  if (isLowerHalfOccupied) {
    // SELFIE / PORTRAIT: People and faces occupy the lower/mid region.
    // DOCK BOTH OVERLAYS IN THE PRISTINE UPPER SKY / OPEN AIR:
    // 1. HUD Card goes to the top-left open sky (zero face collision, zero elevation profile collision!)
    hudCard.posX = 0.14;
    hudCard.posY = 0.14;

    // 2. Course map hovers cleanly in the top-right open sky above heads
    spatialRoute.posX = 0.72;
    spatialRoute.posY = 0.22;
    spatialRoute.scale = 0.68; // Scaled down to stay completely clear of foreheads & hats
  } else if (stats.rightHalfComplexity > stats.leftHalfComplexity * 1.15) {
    // Subject is primarily on the right side:
    spatialRoute.posX = 0.30; // Open left quadrant
    spatialRoute.posY = 0.32;
    spatialRoute.scale = 0.75;
    hudCard.posX = 0.14;
    hudCard.posY = 0.14;
  } else if (stats.leftHalfComplexity > stats.rightHalfComplexity * 1.15) {
    // Subject is primarily on the left side:
    spatialRoute.posX = 0.72; // Open right quadrant
    spatialRoute.posY = 0.32;
    spatialRoute.scale = 0.75;
    hudCard.posX = 0.14;
    hudCard.posY = 0.14;
  } else {
    // Balanced or wide distant athlete:
    spatialRoute.posX = 0.72;
    spatialRoute.posY = 0.28;
    spatialRoute.scale = 0.80;
    hudCard.posX = 0.14;
    hudCard.posY = 0.14;
  }

  // 3. HUD CARD CONFIGURATION
  hudCard.enabled = true;
  hudCard.opacity = 0.94;
  hudCard.orientation = 'straight';
  hudCard.tiltX = 0;
  hudCard.tiltY = 0;

  const elevationConfig: Partial<ElevationOverlayConfig> = {
    enabled: true,
    posY: 0.92,
    height: 52,
    widthPercent: 0.90,
    style: 'glass_ribbon',
  };
  if (activity?.coordinates.length) {
    const placement = chooseAutoRoutePlacement({
      points: activity.coordinates,
      aspect,
      preferred: toRoutePlacement(spatialRoute),
      hudCard,
      elevationConfig,
      complexityGrid: stats.complexityGrid,
    });
    Object.assign(spatialRoute, placement);
  }

  return {
    atmosphere,
    spatialRoute,
    hudCard,
    elevationConfig,
    summary: {
      mood,
      paletteDescription,
      routeColorName,
      accentHex,
      source: 'vision_heuristic',
    },
  };
}

/**
 * Main Auto-Style Entry Point.
 * Generates an efficient thumbnail and invokes Gemini Vision AI via the server endpoint.
 * Seamlessly falls back to local high-precision canvas heuristic if network is offline.
 */
export async function analyzeAndAutoStyle(
  photoUrl: string,
  activity?: StravaActivityData
): Promise<AutoStyleResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      const aspect = img.naturalWidth / (img.naturalHeight || 1);
      const stats = analyzeImageCanvas(img);
      const fallbackResult = deriveStyleFromStats(stats, aspect, activity);

      // Attempt Gemini Vision AI analysis via server route
      try {
        // Downscale image to an efficient 512px thumbnail to minimize bandwidth & token latency
        const thumbCanvas = document.createElement('canvas');
        const maxDim = 512;
        let w = img.naturalWidth || maxDim;
        let h = img.naturalHeight || maxDim;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        thumbCanvas.width = w;
        thumbCanvas.height = h;
        const thumbCtx = thumbCanvas.getContext('2d');

        if (thumbCtx) {
          thumbCtx.drawImage(img, 0, 0, w, h);
          const base64Data = thumbCanvas.toDataURL('image/jpeg', 0.82);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6500);

          const res = await fetch('/api/auto-style', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: 'image/jpeg',
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const aiData = await res.json();
            if (aiData && aiData.atmosphere && aiData.spatialRoute && aiData.hudCard && aiData.layoutEngine?.fits !== false) {
              const noGoZones = parseNoGoZones(aiData.layoutEngine?.no_go_zones);
              const candidateRoute = {
                ...fallbackResult.spatialRoute,
                ...aiData.spatialRoute,
              };
              const mapBox = aiData.layoutEngine?.widgets?.find((widget: any) => widget.type === 'map')?.box;
              const fitWithin = Array.isArray(mapBox) && mapBox.length === 4 && mapBox.every(Number.isFinite)
                ? { x: mapBox[0], y: mapBox[1], width: mapBox[2], height: mapBox[3] }
                : undefined;
              const safePlacement = activity?.coordinates.length
                ? chooseAutoRoutePlacement({
                    points: activity.coordinates,
                    aspect,
                    preferred: toRoutePlacement(candidateRoute),
                    noGoZones,
                    hudCard: { ...fallbackResult.hudCard, ...aiData.hudCard },
                    fitWithin,
                    elevationConfig: {
                      ...fallbackResult.elevationConfig,
                      ...aiData.elevationConfig,
                    },
                  })
                : toRoutePlacement(candidateRoute);
              resolve({
                atmosphere: {
                  ...fallbackResult.atmosphere,
                  ...aiData.atmosphere,
                  grade: 'original', // Guarantee natural photo without neon shifts
                },
                spatialRoute: {
                  ...fallbackResult.spatialRoute,
                  ...candidateRoute,
                  // Keep tilt subtle (12° to 18°) for tactile 3D relief without warping
                  tiltAngle: aiData.spatialRoute.tiltAngle ?? 14,
                  yawAngle: aiData.spatialRoute.yawAngle ?? 0,
                  // Use Gemini's detected open space coordinates or fallback
                  posX: safePlacement.posX,
                  posY: safePlacement.posY,
                  scale: safePlacement.scale,
                  shadowEnabled: true,
                  shadowIntensity: 0.70,
                  shadowOffsetY: 6,
                },
                hudCard: {
                  ...fallbackResult.hudCard,
                  ...aiData.hudCard,
                  posX: aiData.hudCard.posX ?? fallbackResult.hudCard.posX,
                  // Strictly protect against elevation profile collision (> 0.58 is prohibited)
                  posY:
                    aiData.hudCard.posY !== undefined && aiData.hudCard.posY <= 0.58
                      ? aiData.hudCard.posY
                      : fallbackResult.hudCard.posY,
                },
                elevationConfig: aiData.elevationConfig
                  ? { ...fallbackResult.elevationConfig, ...aiData.elevationConfig }
                  : fallbackResult.elevationConfig,
                summary: {
                  mood: aiData.summary?.mood || fallbackResult.summary.mood,
                  paletteDescription: aiData.summary?.paletteDescription || fallbackResult.summary.paletteDescription,
                  routeColorName: aiData.summary?.routeColorName || fallbackResult.summary.routeColorName,
                  accentHex: aiData.summary?.accentHex || fallbackResult.summary.accentHex,
                  source: 'gemini_vision',
                },
                layoutEngine: aiData.layoutEngine,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Gemini vision API route skipped or timed out, using local heuristic:', err);
      }

      // Use local heuristic if API route is unreachable
      resolve(fallbackResult);
    };

    img.onerror = () => {
      resolve({
        atmosphere: { grade: 'original', brightness: 1.0, contrast: 1.0, warmth: 0 },
        spatialRoute: { glowColor: '#FC5200' },
        hudCard: { posX: 0.16, posY: 0.74 },
        summary: {
          mood: 'Original Balanced',
          paletteDescription: 'Default sports telemetry theme',
          routeColorName: 'Strava Racing Orange',
          accentHex: '#FC5200',
          source: 'vision_heuristic',
        },
      });
    };

    img.src = photoUrl;
  });
}

function parseNoGoZones(value: unknown): NormalizedRect[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((box): NormalizedRect[] => {
    if (!Array.isArray(box) || box.length !== 4 || !box.every(Number.isFinite)) return [];
    const [x, y, width, height] = box as number[];
    if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > 1 || y + height > 1) return [];
    return [{ x, y, width, height }];
  });
}
