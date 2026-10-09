import {
  StravaActivityData,
  SpatialRouteConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  ElevationOverlayConfig,
  RouteRenderMode,
  LogoCorner,
} from '../types/poster';

export interface SpatialRenderOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  activity: StravaActivityData;
  spatialRoute: SpatialRouteConfig;
  hudCard: HudCardConfig;
  atmosphere: PhotoAtmosphereConfig;
  elevationConfig?: ElevationOverlayConfig;
  photoImage: HTMLImageElement | null;
  highDpiScale?: number;
  isWatermarked?: boolean;
  logoCorner?: LogoCorner;
}

/**
 * Renders the Mixed-Reality 3D Spatial Telemetry Artwork onto the canvas.
 * Featuring photorealistic in-scene laser route and ultra-clean glass HUD plaque.
 */
export function renderSpatialArtwork({
  canvas,
  width,
  height,
  activity,
  spatialRoute,
  hudCard,
  atmosphere,
  elevationConfig,
  photoImage,
  highDpiScale = 1,
  isWatermarked = true,
  logoCorner = 'top-right',
}: SpatialRenderOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const targetWidth = Math.round(width * highDpiScale);
  const targetHeight = Math.round(height * highDpiScale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.save();
  ctx.scale(highDpiScale, highDpiScale);

  // 1. BASE ATHLETE PHOTO WITH CINEMATIC ATMOSPHERE
  drawBasePhoto(ctx, width, height, photoImage, atmosphere);

  // 2. PROJECTED 3D NEON LASER ROUTE ON GROUND PLANE
  draw3DGroundRoute(ctx, width, height, activity, spatialRoute);

  // 3. FLOATING 3D GLASS HUD TELEMETRY CARD (WITH BOUNDARY SAFETY)
  if (hudCard.enabled) {
    drawGlassHUDCard(ctx, width, height, activity, hudCard, spatialRoute.glowColor);
  }

  // 4. SLEEK ELEVATION PROFILE AT BOTTOM OF CANVAS (MOVABLE UP / DOWN)
  if (elevationConfig && elevationConfig.enabled) {
    drawElevationProfile(ctx, width, height, activity, elevationConfig, spatialRoute);
  }

  // 5. © GPX.photos WATERMARK BRANDING (Removed upon payment)
  if (isWatermarked) {
    drawGpxPhotosWatermark(ctx, width, height, logoCorner);
  }

  ctx.restore();
}

function drawBasePhoto(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement | null,
  atmosphere: PhotoAtmosphereConfig
) {
  if (img && img.complete && img.naturalWidth > 0) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    // 100% Uncropped guarantee: fit completely without cutting or cropping any part of photo
    if (Math.abs(canvasAspect - imgAspect) > 0.005) {
      if (canvasAspect > imgAspect) {
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        drawX = 0;
        drawY = (height - drawH) / 2;
      }
    }

    ctx.save();

    // Filters & Grading: Keep athlete photo 100% natural, true-to-life, and authentic
    if (atmosphere.grade === 'golden_hour') {
      // Gentle, natural sunlight warmth without artificial tint or color shifts
      const b = Math.round(atmosphere.brightness * 101);
      const c = Math.round(atmosphere.contrast * 104);
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(104%) sepia(6%)`;
    } else if (atmosphere.grade === 'natural_warm') {
      // Subtle natural daylight
      const b = Math.round(atmosphere.brightness * 101);
      const c = Math.round(atmosphere.contrast * 102);
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(102%) sepia(3%)`;
    } else if (atmosphere.grade === 'cyber_twilight') {
      // Crisp, cool twilight contrast (STRICTLY NO HUE-ROTATE to preserve true skin & jersey colors)
      const b = Math.round(atmosphere.brightness * 99);
      const c = Math.round(atmosphere.contrast * 105);
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(98%)`;
    } else if (atmosphere.grade === 'high_contrast') {
      // Clean editorial contrast
      const b = Math.round(atmosphere.brightness * 101);
      const c = Math.round(atmosphere.contrast * 108);
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(102%)`;
    } else {
      // 'original' - 100% Natural, authentic photo exactly as captured by athlete
      const b = Math.round(atmosphere.brightness * 100);
      const c = Math.round(atmosphere.contrast * 100);
      const w = atmosphere.warmth || 0;
      if (w !== 0) {
        const sepia = Math.max(0, Math.min(30, Math.round(w * 0.8)));
        ctx.filter = `brightness(${b}%) contrast(${c}%) sepia(${sepia}%)`;
      } else if (b !== 100 || c !== 100) {
        ctx.filter = `brightness(${b}%) contrast(${c}%)`;
      } else {
        ctx.filter = 'none';
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    // Deep asphalt placeholder
    ctx.fillStyle = '#222328';
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Lightens or darkens a hex color by a given percentage (-100 to +100).
 */
function shadeColor(hex: string, percent: number): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Computes normalized elevation (0 to 1) for a route coordinate point,
 * either from intrinsic coordinates, elevationProfile, or smooth synthetic terrain.
 */
function getPointNormalizedElevation(
  coords: { x: number; y: number; elevation?: number }[],
  idx: number,
  elevationProfile?: { distanceKm: number; elevationM: number }[]
): number {
  if (coords[idx]?.elevation !== undefined) {
    let minE = Infinity;
    let maxE = -Infinity;
    for (const c of coords) {
      if (c.elevation !== undefined) {
        if (c.elevation < minE) minE = c.elevation;
        if (c.elevation > maxE) maxE = c.elevation;
      }
    }
    if (maxE > minE) {
      return (coords[idx].elevation! - minE) / (maxE - minE);
    }
  }

  if (elevationProfile && elevationProfile.length > 1) {
    let minE = Infinity;
    let maxE = -Infinity;
    for (const ep of elevationProfile) {
      if (ep.elevationM < minE) minE = ep.elevationM;
      if (ep.elevationM > maxE) maxE = ep.elevationM;
    }
    const progress = idx / Math.max(1, coords.length - 1);
    const sampleIdx = Math.min(
      elevationProfile.length - 1,
      Math.floor(progress * (elevationProfile.length - 1))
    );
    const elev = elevationProfile[sampleIdx].elevationM;
    if (maxE > minE) {
      return (elev - minE) / (maxE - minE);
    }
  }

  // Smooth undulating elevation wave for demo loops
  const p = idx / Math.max(1, coords.length - 1);
  return 0.5 + 0.5 * Math.sin(p * Math.PI * 2 - Math.PI / 2);
}

interface ProjectedRoutePoint {
  x: number;
  y: number;
  depthFactor: number;
  groundContactX: number;
  groundContactY: number;
  normElevation: number;
}

/**
 * Projects 2D GPS points onto a 3D ground plane with perspective foreshortening
 * and optional Z-axis elevation lift.
 */
function projectPointToGround(
  pt: { x: number; y: number; elevation?: number },
  centerX: number,
  centerY: number,
  spatialRoute: SpatialRouteConfig,
  canvasW: number,
  canvasH: number,
  normElevation = 0
): ProjectedRoutePoint {
  // Center coordinates around (0, 0)
  const relX = pt.x - 0.5;
  const relY = pt.y - 0.5;

  // 1. Yaw rotation (around ground vertical axis)
  const radYaw = (spatialRoute.yawAngle * Math.PI) / 180;
  const cosY = Math.cos(radYaw);
  const sinY = Math.sin(radYaw);

  const rotX = relX * cosY - relY * sinY;
  const rotY = relX * sinY + relY * cosY;

  // 2. Pitch tilt (foreshortening onto asphalt ground)
  const radPitch = (spatialRoute.tiltAngle * Math.PI) / 180;
  const cosPitch = Math.cos(radPitch);
  const sinPitch = Math.sin(radPitch);

  // Elevation Z extrusion factor - smoothly emerges with camera pitch angle
  // Scaled continuously by sinPitch so at 0° it is strictly 0 and increases smoothly
  const elev3d = (spatialRoute.elevation3dScale ?? 0.35) * normElevation * 0.16 * sinPitch;

  // 3. 3D transformed point (with elevation lift)
  const groundY = rotY * cosPitch - elev3d;
  const groundZ = (rotY + elev3d * 0.5) * sinPitch;

  // Ground plane contact point (elev = 0) for drop shadow anchoring
  const contactGroundY = rotY * cosPitch;
  const contactGroundZ = rotY * sinPitch;

  // 4. Perspective projection formula (smoothly continuous from 0° upwards)
  // Perspective depth compression is smoothly weighted by sinPitch so 0° has zero distortion
  const effectivePDepth = (spatialRoute.perspectiveDepth ?? 0.65) * Math.sin(radPitch);
  const depthFactor = 1 / Math.max(0.1, 1 + groundZ * effectivePDepth);
  const contactDepthFactor = 1 / Math.max(0.1, 1 + contactGroundZ * effectivePDepth);

  // Unified, consistent base scale eliminates any discontinuous jump between 0° and 1°
  const scaleW = canvasW * 0.55 * spatialRoute.scale;
  const scaleH = scaleW;

  const projX = centerX + rotX * scaleW * depthFactor;
  const projY = centerY + groundY * scaleH * depthFactor;

  const groundContactX = centerX + rotX * scaleW * contactDepthFactor;
  const groundContactY = centerY + contactGroundY * scaleH * contactDepthFactor;

  return {
    x: projX,
    y: projY,
    depthFactor,
    groundContactX,
    groundContactY,
    normElevation,
  };
}

function getLuminanceFactor(hexColor: string): number {
  const c = hexColor.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum > 0.65) return 0.55;
  if (lum > 0.45) return 0.75;
  return 1.0;
}

/**
 * Renders the 3D-projected GPX telemetry route using the comprehensive 3D Visualization Pipeline:
 * - Perspective ground-plane transformation & Z-elevation lift
 * - Ground contact drop shadows & ambient occlusion anchoring
 * - Volumetric tube extrusion (under-casing bevel, mid-body, specular ridge highlight)
 * - Multi-pass neon/emissive laser glow
 * - Perspective width tapering & aerial haze attenuation
 */
function draw3DGroundRoute(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  spatialRoute: SpatialRouteConfig
) {
  const coords = activity.coordinates;
  if (!coords || coords.length < 2) return;

  const centerX = width * spatialRoute.posX;
  const centerY = height * spatialRoute.posY;

  // Project all points into screen space with elevation
  const projectedPts: ProjectedRoutePoint[] = coords.map((pt, idx) => {
    const normElev = getPointNormalizedElevation(coords, idx, activity.elevationProfile);
    return projectPointToGround(pt, centerX, centerY, spatialRoute, width, height, normElev);
  });

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const baseColor = spatialRoute.glowColor;
  const isBlack =
    baseColor.toLowerCase() === '#000000' ||
    baseColor.toLowerCase() === '#000' ||
    baseColor === 'black';
  const lumFactor = getLuminanceFactor(baseColor);
  const lineW = Math.max(1.0, Math.min(14.0, spatialRoute.lineWidth || 2.8));
  const renderMode: RouteRenderMode = spatialRoute.renderMode || 'volumetric_tube';
  const hasGlow =
    spatialRoute.glowEnabled !== false &&
    (spatialRoute.glowIntensity ?? 1) > 0.05 &&
    !isBlack &&
    renderMode !== 'minimal_vector';
  const intensity = (spatialRoute.glowIntensity ?? 0.85) * lumFactor;
  const shadowEnabled = spatialRoute.shadowEnabled !== false && renderMode !== 'minimal_vector';
  const shadowIntensity = spatialRoute.shadowIntensity ?? 0.65;
  const pitchSin = Math.sin((spatialRoute.tiltAngle * Math.PI) / 180);
  // Base shadow offset ensures tactile depth and elevation even at flat or subtle angles
  const shadowOffsetY = Math.max(3, (spatialRoute.shadowOffsetY ?? 5) * (0.6 + 0.4 * pitchSin));
  const shadowOffsetX = 2.5;
  const hasElevationLift = (spatialRoute.elevation3dScale ?? 0.35) > 0.05 && pitchSin > 0.02;

  // =========================================================================
  // PASS 1: GROUND CONTACT DROP SHADOW & AMBIENT OCCLUSION
  // Anchors the floating route into physical contact with tactile dimensional depth
  // =========================================================================
  if (shadowEnabled) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    const contactPts = projectedPts.map((p) => ({
      x: p.groundContactX + shadowOffsetX,
      y: p.groundContactY + shadowOffsetY,
    }));

    // Soft blurred ground shadow with warm ambient occlusion
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.55 * shadowIntensity})`;
    ctx.lineWidth = lineW * 1.6;
    ctx.shadowColor = `rgba(0, 0, 0, ${0.75 * shadowIntensity})`;
    ctx.shadowBlur = Math.min(18, 8 + shadowOffsetY * 0.8);
    ctx.shadowOffsetX = shadowOffsetX * 0.8;
    ctx.shadowOffsetY = shadowOffsetY * 0.8;
    strokePath(ctx, contactPts);

    // Subtle vertical descent drop tethers if route is elevated in 3D
    if (hasElevationLift) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.25 * shadowIntensity * pitchSin})`;
      ctx.setLineDash([2, 4]);

      // Draw drop tethers every N points
      const step = Math.max(3, Math.floor(projectedPts.length / 10));
      for (let i = 0; i < projectedPts.length; i += step) {
        const pt = projectedPts[i];
        const dist = Math.hypot(pt.x - pt.groundContactX, pt.y - pt.groundContactY);
        if (dist > 4) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.groundContactX, pt.groundContactY + shadowOffsetY);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // PASS 2: VOLUMETRIC TUBE EXTRUSION
  // Under-casing dark bevel, cylindrical tube mid-body, specular ridge highlight
  // =========================================================================
  if (renderMode === 'volumetric_tube' && !isBlack) {
    const underBevelColor = shadeColor(baseColor, -42);
    const specularColor = shadeColor(baseColor, 52);

    // 2A: Ambient laser radiance (if glow is enabled)
    if (hasGlow) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = lineW + 5;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = Math.min(14, 10 * intensity);
      ctx.globalAlpha = 0.28 * lumFactor;
      strokePath(ctx, projectedPts);
      ctx.restore();
    }

    // 2B: Dark Under-Casing Bevel (Simulates cylindrical underside depth)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = underBevelColor;
    ctx.lineWidth = lineW + 1.2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1.2;
    ctx.globalAlpha = 0.95;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // 2C: Mid-Body Cylindrical Extrusion
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = lineW;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = Math.min(6, 4 * intensity);
    ctx.globalAlpha = 0.98;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // 2D: Specular Ridge Highlight (Simulates reflective top curvature)
    if (spatialRoute.tubeSpecular !== false) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = specularColor;
      ctx.lineWidth = Math.max(0.7, lineW * 0.42);
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 1.5;
      ctx.globalAlpha = 0.85;
      strokePath(ctx, projectedPts);
      ctx.restore();
    }

    // 2E: White-Hot Core Filament
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = Math.max(0.6, lineW * 0.22);
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 2;
    ctx.globalAlpha = 0.95;
    strokePath(ctx, projectedPts);
    ctx.restore();

  } else if (isBlack || renderMode === 'archival_shadow') {
    // =========================================================================
    // PASS: ARCHIVAL SHADOW & ULTRA-CRISP BLACK VECTOR
    // Razor-sharp museum-grade line with subtle under-bevel
    // =========================================================================
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = isBlack ? '#000000' : baseColor;
    ctx.lineWidth = lineW;
    if (shadowEnabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1.0;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // High legibility micro-core
    ctx.save();
    ctx.strokeStyle = isBlack ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(0.8, lineW * 0.25);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = isBlack ? 0.4 : 0.85;
    strokePath(ctx, projectedPts);
    ctx.restore();

  } else if (renderMode === 'minimal_vector' || !hasGlow) {
    // =========================================================================
    // PASS: MINIMAL ARCHITECTURAL VECTOR
    // =========================================================================
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = lineW;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // Crisp inner core line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(0.8, lineW * 0.28);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.9;
    strokePath(ctx, projectedPts);
    ctx.restore();

  } else {
    // =========================================================================
    // PASS: MULTI-PASS NEON / EMISSIVE LASER RIBBON
    // Pass 1: Ambient radiance ('screen')
    // Pass 2: Defined laser body
    // Pass 3: White-hot core filament
    // =========================================================================
    // 1. Ambient wide ground aura
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = lineW + 4;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = Math.min(18, 14 * intensity);
    ctx.globalAlpha = 0.38 * lumFactor;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // 2. Defined Laser Ribbon Body
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = lineW;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = Math.min(9, 6 * intensity);
    ctx.globalAlpha = 0.95;
    strokePath(ctx, projectedPts);
    ctx.restore();

    // 3. Crisp Core Filament
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 250, 240, 0.98)';
    ctx.lineWidth = Math.max(0.9, lineW * 0.28);
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 2;
    ctx.globalAlpha = 0.95;
    strokePath(ctx, projectedPts);
    ctx.restore();
  }

  // =========================================================================
  // PASS 3: PERSPECTIVE DEPTH TAPER & ATMOSPHERIC HAZE
  // Segment-by-segment depth attenuation when tilted into the ground
  // =========================================================================
  if (spatialRoute.depthTapering !== false && spatialRoute.tiltAngle > 10) {
    ctx.save();
    ctx.lineCap = 'round';
    // Draw subtle aerial atmospheric haze over farthest segments
    for (let i = 0; i < projectedPts.length - 1; i++) {
      const p1 = projectedPts[i];
      const p2 = projectedPts[i + 1];
      const avgDepth = (p1.depthFactor + p2.depthFactor) / 2;

      // When depthFactor < 0.85, the point is far into the horizon
      if (avgDepth < 0.85) {
        const fogAlpha = (1 - avgDepth) * 0.22;
        ctx.strokeStyle = `rgba(18, 20, 26, ${fogAlpha})`;
        ctx.lineWidth = lineW + 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  ctx.restore();
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[]
) {
  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
}

function isHexDark(hex: string): boolean {
  if (!hex) return false;
  const clean = hex.replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 115;
}

/**
 * Draws the Photorealistic 3D Glass HUD Telemetry Plaque.
 * Clamps coordinates so it NEVER goes off screen, and supports both Straight and 3D Slanted orientations.
 */
function drawGlassHUDCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  hudCard: HudCardConfig,
  glowColor: string
) {
  const cardW = 270 * hudCard.scale;
  const cardH = 182 * hudCard.scale;
  const radius = 14 * hudCard.scale;

  // Determine actual tilt angles based on orientation
  let tiltY = 0;
  let tiltX = 0;

  if (hudCard.orientation === 'straight') {
    tiltY = 0;
    tiltX = 0;
  } else if (hudCard.orientation === 'slanted_left') {
    tiltY = 16;
    tiltX = 18;
  } else if (hudCard.orientation === 'slanted_right') {
    tiltY = -16;
    tiltX = 18;
  } else {
    // Custom user sliders
    tiltY = hudCard.tiltY;
    tiltX = hudCard.tiltX;
  }

  // Safe boundary clamping: compute transformed footprint so it NEVER clips off screen
  const padding = 20;
  const maxSkewXOffset = Math.abs(Math.tan((-tiltY * Math.PI) / 180) * cardH);
  const minX = padding + (tiltY > 0 ? maxSkewXOffset : 0);
  const maxX = width - cardW - padding - (tiltY < 0 ? maxSkewXOffset : 0);
  const minY = padding;
  const maxY = height - cardH - padding;

  const rawX = width * hudCard.posX;
  const rawY = height * hudCard.posY;

  // Clamp within canvas boundaries
  const originX = Math.max(minX, Math.min(maxX, rawX));
  const originY = Math.max(minY, Math.min(maxY, rawY));

  ctx.save();
  ctx.translate(originX, originY);

  // Apply 3D Perspective Transform
  if (tiltY !== 0 || tiltX !== 0) {
    const skewXRad = (-tiltY * Math.PI) / 180;
    const skewYRad = (tiltX * 0.3 * Math.PI) / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 0.94, 0, 0);
  }

  // 1. SOFT AMBIENT GROUND CONTACT SHADOW
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 28 * hudCard.scale;
  ctx.shadowOffsetX = 10 * hudCard.scale;
  ctx.shadowOffsetY = 24 * hudCard.scale;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  roundRect(ctx, 4, 8, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  // 2. 3D GLASS THICKNESS REACTION EDGE (Beveled Glass Depth)
  const thickness = (hudCard.glassThickness || 3) * hudCard.scale;
  if (thickness > 0) {
    ctx.save();
    // Glass edge tint (gives physical depth to the acrylic slab)
    ctx.fillStyle = hudCard.style === 'frosted_ice'
      ? 'rgba(200, 220, 235, 0.35)'
      : 'rgba(8, 10, 14, 0.9)';
    roundRect(ctx, thickness * 0.8, thickness * 1.2, cardW, cardH, radius);
    ctx.fill();
    ctx.restore();
  }

  // 3. MAIN GLASS SLAB BODY (GLASSMORPHISM INTENSITY & TRANSLUCENCY)
  ctx.save();
  const hudGlassIntensity = hudCard.glassmorphismIntensity !== undefined
    ? Math.max(0, Math.min(100, hudCard.glassmorphismIntensity)) / 100
    : 0.75;

  // Modulate translucency dynamically based on glassmorphism intensity slider:
  // 0% = 0.20 (crystal clear / ultra translucent)
  // 50% = 0.60 (balanced modern frosted glass)
  // 100% = 0.98 (rich smoked glass / heavy frosted acrylic)
  const computedAlpha = Math.max(0.18, Math.min(1.0, 0.20 + hudGlassIntensity * 0.78)) * (hudCard.opacity ?? 1.0);
  ctx.globalAlpha = computedAlpha;

  // Glass Face Gradient modulated by glassmorphism intensity
  const glassGrad = ctx.createLinearGradient(0, 0, cardW * 0.9, cardH);
  if (hudCard.style === 'frosted_ice') {
    const iceAlpha1 = (0.15 + hudGlassIntensity * 0.40).toFixed(3);
    const iceAlpha2 = (0.10 + hudGlassIntensity * 0.30).toFixed(3);
    const iceAlpha3 = (0.12 + hudGlassIntensity * 0.35).toFixed(3);
    glassGrad.addColorStop(0, `rgba(240, 245, 255, ${iceAlpha1})`);
    glassGrad.addColorStop(0.5, `rgba(210, 225, 245, ${iceAlpha2})`);
    glassGrad.addColorStop(1, `rgba(180, 205, 235, ${iceAlpha3})`);
  } else if (hudCard.style === 'carbon_fiber') {
    const cfAlpha1 = (0.75 + hudGlassIntensity * 0.22).toFixed(3);
    const cfAlpha2 = (0.78 + hudGlassIntensity * 0.20).toFixed(3);
    const cfAlpha3 = (0.80 + hudGlassIntensity * 0.18).toFixed(3);
    glassGrad.addColorStop(0, `rgba(18, 18, 20, ${cfAlpha1})`);
    glassGrad.addColorStop(0.5, `rgba(14, 14, 16, ${cfAlpha2})`);
    glassGrad.addColorStop(1, `rgba(10, 10, 12, ${cfAlpha3})`);
  } else {
    // Smoked Glass / Neon Rim
    const smokeAlpha1 = (0.35 + hudGlassIntensity * 0.58).toFixed(3);
    const smokeAlpha2 = (0.40 + hudGlassIntensity * 0.54).toFixed(3);
    const smokeAlpha3 = (0.45 + hudGlassIntensity * 0.51).toFixed(3);
    glassGrad.addColorStop(0, `rgba(26, 28, 34, ${smokeAlpha1})`);
    glassGrad.addColorStop(0.5, `rgba(16, 18, 22, ${smokeAlpha2})`);
    glassGrad.addColorStop(1, `rgba(10, 12, 15, ${smokeAlpha3})`);
  }

  ctx.fillStyle = glassGrad;
  roundRect(ctx, 0, 0, cardW, cardH, radius);
  ctx.fill();

  // Fine carbon mesh or micro-grid texture inside glass
  ctx.save();
  ctx.clip(); // clip within rounded rect
  ctx.strokeStyle = hudCard.style === 'carbon_fiber'
    ? 'rgba(255, 255, 255, 0.06)'
    : `rgba(255, 255, 255, ${(0.015 + hudGlassIntensity * 0.035).toFixed(3)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 0; y < cardH; y += 4.5 * hudCard.scale) {
    ctx.moveTo(0, y);
    ctx.lineTo(cardW, y);
  }
  ctx.stroke();

  // Diagonal Specular Glass Reflection Sheen (gives high-end glass realism)
  const sheenGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
  const sheenAlpha = 0.06 + hudGlassIntensity * 0.18;
  sheenGrad.addColorStop(0, `rgba(255, 255, 255, ${sheenAlpha.toFixed(3)})`);
  sheenGrad.addColorStop(0.3, `rgba(255, 255, 255, ${(sheenAlpha * 0.35).toFixed(3)})`);
  sheenGrad.addColorStop(0.31, 'rgba(255, 255, 255, 0)');
  sheenGrad.addColorStop(1, `rgba(255, 255, 255, ${(sheenAlpha * 0.2).toFixed(3)})`);
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, cardW, cardH);
  ctx.restore();

  // 4. POLISHED SPECULAR GLASS RIM BEVEL
  ctx.save();
  const rimGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
  if (hudCard.style === 'neon_rim') {
    rimGrad.addColorStop(0, '#FFFFFF');
    rimGrad.addColorStop(0.3, glowColor);
    rimGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.5)');
    rimGrad.addColorStop(1, glowColor);
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 2.5 * hudCard.scale;
  } else {
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // bright specular top-left
    rimGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
    rimGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 2 * hudCard.scale;
  }
  roundRect(ctx, 0, 0, cardW, cardH, radius);
  ctx.stroke();
  ctx.restore();

  // 5. ACTIVITY / ROUTE NAME & YEAR BRAND HEADER (USER CUSTOMIZABLE)
  const showHeader = hudCard.showHeader !== false && hudCard.showStravaLogo !== false;
  if (showHeader) {
    const rawTitle = (hudCard.headerTitle || activity.name || 'EXPEDITION TELEMETRY').toUpperCase();
    const eventYear = (hudCard.headerYear || '').toUpperCase();

    // Determine high-contrast letter color adapted to the HUD background
    const isLightCard = hudCard.style === 'frosted_ice';
    const colorIsDark = isHexDark(glowColor || '#FC5200');

    let titleColor = '#FC5200';
    let titleShadowColor = 'rgba(252, 82, 0, 0.5)';
    let yearColor = 'rgba(240, 240, 245, 0.90)';
    let dividerColor = 'rgba(255, 255, 255, 0.12)';

    if (isLightCard) {
      // Light Frosted Ice Background: letters MUST be dark and legible
      titleColor = colorIsDark && glowColor !== '#000000' ? glowColor : '#0F172A';
      titleShadowColor = 'transparent';
      yearColor = 'rgba(15, 23, 42, 0.75)';
      dividerColor = 'rgba(15, 23, 42, 0.15)';
    } else {
      // Dark Backgrounds (Smoked Glass, Carbon Fiber, Neon Rim): letters MUST NEVER be dark
      if (colorIsDark) {
        // If route color is black or very dark, render title in crisp brilliant white
        titleColor = '#FFFFFF';
        titleShadowColor = 'rgba(255, 255, 255, 0.35)';
      } else {
        titleColor = glowColor || '#FC5200';
        titleShadowColor = glowColor || 'rgba(252, 82, 0, 0.6)';
      }
      yearColor = 'rgba(240, 240, 245, 0.90)';
      dividerColor = 'rgba(255, 255, 255, 0.12)';
    }

    ctx.save();
    ctx.fillStyle = titleColor;
    ctx.shadowColor = titleShadowColor;
    ctx.shadowBlur = isLightCard ? 0 : 6 * hudCard.scale;
    ctx.font = `italic 900 ${18 * hudCard.scale}px "Plus Jakarta Sans", sans-serif`;
    ctx.letterSpacing = '0.04em';
    ctx.textAlign = 'left';

    // Calculate available width for event title based on whether year is shown
    const yearWidth = eventYear ? 55 * hudCard.scale : 0;
    const maxTitleWidth = cardW - 40 * hudCard.scale - yearWidth;

    let displayTitle = rawTitle;
    while (ctx.measureText(displayTitle).width > maxTitleWidth && displayTitle.length > 4) {
      displayTitle = displayTitle.slice(0, -1);
    }
    if (displayTitle !== rawTitle) {
      displayTitle = displayTitle.trim() + '…';
    }

    ctx.fillText(displayTitle, 20 * hudCard.scale, 35 * hudCard.scale);
    ctx.shadowBlur = 0;

    // Optional Year Tag on the right side of header
    if (eventYear) {
      ctx.font = `bold ${13 * hudCard.scale}px "JetBrains Mono", monospace`;
      ctx.fillStyle = yearColor;
      ctx.textAlign = 'right';
      ctx.fillText(eventYear, cardW - 20 * hudCard.scale, 35 * hudCard.scale);
    }
    ctx.restore();

    // Hairline divider under header with adapted contrast
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20 * hudCard.scale, 47 * hudCard.scale);
    ctx.lineTo(cardW - 20 * hudCard.scale, 47 * hudCard.scale);
    ctx.stroke();
  }

  // 6. PLAQUE TELEMETRY STATS (CUSTOMIZABLE)
  const rows = hudCard.customMetrics && hudCard.customMetrics.length === 4
    ? hudCard.customMetrics
    : [
        { label: 'Distance:', value: `${activity.distanceKm} km` },
        { label: 'Time:', value: activity.durationFormatted },
        { label: 'Elevation Gain:', value: `${activity.elevationGainM.toLocaleString()} m` },
        { label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:', value: activity.avgPaceOrSpeed },
      ];

  const rowStartY = 70 * hudCard.scale;
  const rowGap = 25 * hudCard.scale;

  rows.forEach((row, i) => {
    const curY = rowStartY + i * rowGap;

    // Stat Label (Clean Sans)
    ctx.font = `500 ${12.5 * hudCard.scale}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = hudCard.style === 'frosted_ice'
      ? 'rgba(20, 25, 35, 0.85)'
      : 'rgba(230, 230, 235, 0.85)';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 20 * hudCard.scale, curY);

    // Stat Value (Bold Tabular Monospace)
    ctx.font = `bold ${13.5 * hudCard.scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = hudCard.style === 'frosted_ice'
      ? '#0F172A'
      : '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(row.value, cardW - 20 * hudCard.scale, curY);
  });

  ctx.restore(); // end glass body
  ctx.restore(); // end 3D transform
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a floating, cinematic elevation profile ribbon at the bottom of the canvas.
 * Can be positioned vertically (moved up/down) to integrate seamlessly with the athlete photo.
 */
function drawElevationProfile(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  config: ElevationOverlayConfig,
  spatialRoute: SpatialRouteConfig
) {
  const glowColor = spatialRoute.glowColor || '#FC5200';
  const lineW = Math.max(1.0, Math.min(14.0, spatialRoute.lineWidth || 2.8));
  const isBlack = glowColor.toLowerCase() === '#000000' || glowColor.toLowerCase() === '#000' || glowColor === 'black';
  const hasGlow = spatialRoute.glowEnabled !== false && (spatialRoute.glowIntensity ?? 1) > 0.05 && !isBlack;

  let profile = activity.elevationProfile;
  if (!profile || profile.length < 2) {
    // Generate fallback profile if not in GPX
    const dist = activity.distanceKm || 97.36;
    const baseEle = 1500;
    const gain = activity.elevationGainM || 1200;
    profile = [
      { distanceKm: 0, elevationM: baseEle },
      { distanceKm: dist * 0.25, elevationM: baseEle + gain * 0.4 },
      { distanceKm: dist * 0.5, elevationM: baseEle + gain * 0.9 },
      { distanceKm: dist * 0.75, elevationM: baseEle + gain * 0.5 },
      { distanceKm: dist, elevationM: baseEle + gain * 0.1 },
    ];
  }

  const profW = width * (config.widthPercent || 0.88);
  const startX = (width - profW) / 2;
  const baseY = height * config.posY;
  const profH = config.height || 52;
  const topY = baseY - profH;

  let minEle = Infinity;
  let maxEle = -Infinity;
  let peakIdx = 0;

  profile.forEach((pt, idx) => {
    if (pt.elevationM < minEle) minEle = pt.elevationM;
    if (pt.elevationM > maxEle) {
      maxEle = pt.elevationM;
      peakIdx = idx;
    }
  });

  const totalDist = profile[profile.length - 1].distanceKm || activity.distanceKm || 1;
  const eleSpan = Math.max(30, maxEle - minEle);

  // Map profile points to canvas coordinates
  const points = profile.map((pt) => {
    const x = startX + (pt.distanceKm / totalDist) * profW;
    const y = baseY - ((pt.elevationM - minEle) / eleSpan) * profH;
    return { x, y, ele: pt.elevationM, dist: pt.distanceKm };
  });

  ctx.save();
  ctx.globalAlpha = config.opacity || 0.85;

  // 1. BASELINE GROUNDING
  ctx.save();
  ctx.strokeStyle = isBlack ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, baseY);
  ctx.lineTo(startX + profW, baseY);
  ctx.stroke();
  ctx.restore();

  // 2. FILLED GRADIENT AREA UNDER PROFILE
  if (config.style === 'glass_ribbon') {
    ctx.save();
    const areaGrad = ctx.createLinearGradient(0, topY, 0, baseY);
    if (isBlack) {
      areaGrad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
      areaGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
      areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (!hasGlow) {
      // Matte subtle area fill
      areaGrad.addColorStop(0, glowColor + '30');
      areaGrad.addColorStop(0.7, glowColor + '0A');
      areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      areaGrad.addColorStop(0, glowColor + '55'); // ~33% opacity at peak
      areaGrad.addColorStop(0.7, glowColor + '18');
      areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(startX + profW, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. RIDGE LINE (Linked directly to spatialRoute.lineWidth and glowColor)
  ctx.save();
  ctx.strokeStyle = isBlack ? '#000000' : glowColor;
  ctx.lineWidth = lineW;
  if (hasGlow) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = Math.min(16, 8 * (spatialRoute.glowIntensity ?? 0.85));
  } else if (isBlack && spatialRoute.glowEnabled !== false) {
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 2;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  ctx.restore();

  // 4. CORE HIGHLIGHT FILAMENT (Only for colored / light lines, omitted for black)
  if (!isBlack) {
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(0.8, lineW * 0.3);
    ctx.globalAlpha = hasGlow ? 0.9 : 0.75;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  // 5. PEAK MARKER & LABELS
  if (config.showLabels && points.length > 0) {
    const peakPt = points[peakIdx];

    // Peak Dot Marker
    ctx.save();
    ctx.fillStyle = isBlack ? '#000000' : '#FFFFFF';
    if (hasGlow) {
      ctx.shadowColor = isBlack ? 'rgba(255,255,255,0.6)' : glowColor;
      ctx.shadowBlur = 4;
    }
    ctx.beginPath();
    ctx.arc(peakPt.x, peakPt.y, Math.max(2.5, lineW * 0.75), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Peak Label
    ctx.save();
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = isBlack ? '#000000' : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = isBlack ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(`▲ ${Math.round(maxEle)}m`, peakPt.x, Math.max(16, peakPt.y - 6));
    ctx.restore();

    // Left Start Elevation & Right Distance
    ctx.save();
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = isBlack ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.7)';
    ctx.shadowColor = isBlack ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2;
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(points[0].ele)}m`, startX, baseY + 12);

    ctx.textAlign = 'right';
    ctx.fillText(`${activity.distanceKm} km`, startX + profW, baseY + 12);

    // Center Elevation Gain Badge
    ctx.textAlign = 'center';
    ctx.fillStyle = isBlack ? '#000000' : glowColor;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(`▲ +${activity.elevationGainM.toLocaleString()}m ELEVATION GAIN`, startX + profW / 2, baseY + 12);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the polished GPX.photos brand hallmark badge on photos.
 * Sleek, professional gallery studio mark without "preview" text.
 */
/**
 * Draws the vector emblem of GPX.photos (the tilted postcard with mountain track & pin)
 */
function drawPostcardLogoEmblem(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number = 1.0) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);

  // 1. Tilted Back Card (Deep Blue)
  ctx.save();
  ctx.translate(-3, -2);
  ctx.rotate((-16 * Math.PI) / 180);
  ctx.fillStyle = '#005BB5';
  roundRect(ctx, -24, -17, 48, 34, 6);
  ctx.fill();
  ctx.restore();

  // 2. Front Photo Card (White Border + Landscape Artwork)
  ctx.save();
  ctx.translate(2, 2);
  ctx.rotate((-8 * Math.PI) / 180);

  // White Photo Border
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, -24, -17, 48, 34, 5.5);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Inner Photo Clip
  ctx.save();
  roundRect(ctx, -22, -15, 44, 30, 4);
  ctx.clip();

  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, -15, 0, 15);
  skyGrad.addColorStop(0, '#008CE8');
  skyGrad.addColorStop(0.7, '#2CB0FF');
  skyGrad.addColorStop(1, '#66C8FF');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-22, -15, 44, 30);

  // Distant Mountains
  ctx.fillStyle = '#2B77BD';
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.lineTo(-12, -2);
  ctx.lineTo(-2, 4);
  ctx.lineTo(8, -5);
  ctx.lineTo(18, 2);
  ctx.lineTo(24, -3);
  ctx.lineTo(24, 15);
  ctx.lineTo(-22, 15);
  ctx.closePath();
  ctx.fill();

  // Main Summit Peak (Faceted)
  ctx.fillStyle = '#103D70'; // Shadow
  ctx.beginPath();
  ctx.moveTo(-15, 12);
  ctx.lineTo(-1, -8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1E5C9E'; // Lit Face
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(12, 12);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();

  // Snowcap
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(-3, -4);
  ctx.lineTo(-1, -3);
  ctx.lineTo(2, -4);
  ctx.closePath();
  ctx.fill();

  // Water Surface
  ctx.fillStyle = '#007ECC';
  ctx.fillRect(-22, 7, 44, 8);

  // Shore Pine Silhouettes
  ctx.fillStyle = '#081E38';
  ctx.beginPath();
  ctx.moveTo(-22, 15);
  ctx.lineTo(-22, 5);
  ctx.lineTo(-18, 8);
  ctx.lineTo(-14, 15);
  ctx.moveTo(14, 15);
  ctx.lineTo(18, 6);
  ctx.lineTo(22, 15);
  ctx.fill();

  // Orange GPS Route
  ctx.strokeStyle = '#FF5500';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 9);
  ctx.lineTo(-6, 2);
  ctx.lineTo(0, 5);
  ctx.lineTo(3, -2);
  ctx.lineTo(12, -6);
  ctx.stroke();

  // Waypoints
  const waypoints = [
    { x: -14, y: 9 },
    { x: -6, y: 2 },
    { x: 0, y: 5 },
    { x: 3, y: -2 },
  ];
  waypoints.forEach((pt) => {
    ctx.fillStyle = '#FF5500';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Orange Summit Pin
  ctx.fillStyle = '#FF5500';
  ctx.beginPath();
  ctx.arc(12, -10, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -9.5);
  ctx.lineTo(12, -6);
  ctx.lineTo(15, -9.5);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(12, -10, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end clip
  ctx.restore(); // end front card
  ctx.restore(); // end emblem
}

/**
 * Draws the prominent GPX.photos promotional brand hallmark badge on free images.
 * Placed in the selected corner (top-right, top-left, bottom-right, bottom-left).
 */
function drawGpxPhotosWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  corner: LogoCorner = 'top-right'
) {
  ctx.save();

  // Hallmark badge dimensions
  const badgeW = 265;
  const badgeH = 58;
  const margin = 28;

  let badgeX = width - badgeW - margin;
  let badgeY = margin;

  if (corner === 'top-left') {
    badgeX = margin;
    badgeY = margin;
  } else if (corner === 'bottom-left') {
    badgeX = margin;
    badgeY = height - badgeH - margin;
  } else if (corner === 'bottom-right') {
    badgeX = width - badgeW - margin;
    badgeY = height - badgeH - margin;
  } else {
    // top-right default
    badgeX = width - badgeW - margin;
    badgeY = margin;
  }

  // Premium dark smoked glass backing with soft shadow
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fillStyle = 'rgba(9, 11, 16, 0.94)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;
  ctx.fill();

  // Subtle luminous rim border
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.stroke();

  // Draw the official GPX.photos Postcard Emblem centered vertically
  const emblemCenterY = badgeY + badgeH / 2;
  drawPostcardLogoEmblem(ctx, badgeX + 34, emblemCenterY, 0.95);

  // Main Brand Name: gpx.photos (cleanly vertically centered without the 3D telemetry tagline)
  const textStartX = badgeX + 70;
  const textBaseY = badgeY + badgeH / 2 + 8;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // "gpx" (Bold White)
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 4;
  ctx.fillText('gpx', textStartX, textBaseY);

  const gpxW = ctx.measureText('gpx').width;

  // "." (Orange Dot)
  const dotRadius = 3.6;
  const dotX = textStartX + gpxW + 5.5;
  const dotY = textBaseY - 6.5;
  ctx.fillStyle = '#FF5500';
  ctx.shadowColor = 'rgba(255, 85, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  // "photos" (Bold White)
  const photosStartX = dotX + dotRadius + 5;
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 4;
  ctx.fillText('photos', photosStartX, textBaseY);

  ctx.restore();
}
