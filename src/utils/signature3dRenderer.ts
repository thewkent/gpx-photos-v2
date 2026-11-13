import {
  StravaActivityData,
  SpatialRouteConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  ElevationOverlayConfig,
  LogoCorner,
} from '../types/poster';

export interface SignatureRenderOptions {
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
 * Signature 3D — a futuristic, sculptural route treatment.
 * The route is rendered as a dimensional object with a bevelled top face,
 * an extruded side wall, contact shadow and restrained energy accents.
 * It deliberately does not share implementation with the Classic renderer.
 */
export function renderSignature3DArtwork(options: SignatureRenderOptions): void {
  const {
    canvas, width, height, activity, spatialRoute, hudCard, atmosphere,
    elevationConfig, photoImage, highDpiScale = 1, isWatermarked = true,
    logoCorner = 'top-right',
  } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = Math.max(1, Math.round(width * highDpiScale));
  canvas.height = Math.max(1, Math.round(height * highDpiScale));
  ctx.save();
  ctx.scale(highDpiScale, highDpiScale);

  drawPhoto(ctx, width, height, photoImage, atmosphere);
  drawSculptedRoute(ctx, width, height, activity, spatialRoute);
  if (elevationConfig?.enabled && activity.elevationProfile?.length > 1) {
    drawElevation(ctx, width, height, activity, elevationConfig);
  }
  if (hudCard.enabled) drawTelemetry(ctx, width, height, activity, hudCard);
  if (isWatermarked) drawBrand(ctx, width, height, logoCorner);
  ctx.restore();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | null,
  atmosphere: PhotoAtmosphereConfig,
) {
  ctx.fillStyle = '#080d14';
  ctx.fillRect(0, 0, width, height);
  if (image?.complete && image.naturalWidth > 0) {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.save();
    ctx.filter = `brightness(${Math.max(0.5, Math.min(1.5, atmosphere.brightness))}) contrast(${Math.max(0.5, Math.min(1.6, atmosphere.contrast))})`;
    ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    ctx.restore();
  }

  // A cinematic vignette keeps the photograph alive while giving the object contrast.
  const vignette = ctx.createRadialGradient(width * 0.52, height * 0.48, height * 0.12, width * 0.5, height * 0.5, height * 0.9);
  vignette.addColorStop(0, 'rgba(4,8,14,0)');
  vignette.addColorStop(1, 'rgba(4,8,14,0.36)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  const lower = ctx.createLinearGradient(0, height * 0.58, 0, height);
  lower.addColorStop(0, 'rgba(4,8,14,0)');
  lower.addColorStop(1, 'rgba(4,8,14,0.28)');
  ctx.fillStyle = lower;
  ctx.fillRect(0, 0, width, height);
}

interface Point3 {
  x: number;
  y: number;
  depth: number;
  elevation: number;
}

interface RibbonVertex {
  x: number;
  y: number;
}

function drawSculptedRoute(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  config: SpatialRouteConfig,
) {
  const coords = activity.coordinates;
  if (!coords || coords.length < 2) return;

  const minX = Math.min(...coords.map(p => p.x));
  const maxX = Math.max(...coords.map(p => p.x));
  const minY = Math.min(...coords.map(p => p.y));
  const maxY = Math.max(...coords.map(p => p.y));
  const spanX = Math.max(0.0001, maxX - minX);
  const spanY = Math.max(0.0001, maxY - minY);
  const elevations = coords.map(p => p.elevation).filter((v): v is number => Number.isFinite(v));
  const minEle = elevations.length ? Math.min(...elevations) : 0;
  const maxEle = elevations.length ? Math.max(...elevations) : 0;
  const yaw = config.yawAngle * Math.PI / 180;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const anchorX = width * Math.max(0.08, Math.min(0.92, config.posX));
  const anchorY = height * Math.max(0.12, Math.min(0.88, config.posY));
  const targetW = width * 0.55 * config.scale;
  const targetH = height * 0.46 * config.scale;
  const pitch = Math.max(0.48, Math.min(0.9, 0.48 + Math.sin(Math.max(14, config.tiltAngle) * Math.PI / 180) * 0.62));

  const route = coords.map(p => {
    const nx = (p.x - minX) / spanX - 0.5;
    const ny = (p.y - minY) / spanY - 0.5;
    const rx = nx * cos - ny * sin;
    const ry = nx * sin + ny * cos;
    const depth = Math.max(0, Math.min(1, (p.y - minY) / spanY));
    const perspective = 0.76 + depth * 0.34;
    const elevation = p.elevation !== undefined && maxEle > minEle ? (p.elevation - minEle) / (maxEle - minEle) : 0;
    const lift = elevation * (config.elevation3dScale ?? 0.22) * height * 0.024;
    return {
      x: anchorX + rx * targetW * perspective,
      y: anchorY + ry * targetH * pitch - lift,
      depth,
      elevation,
    };
  }).filter((p, i, all) => i === 0 || Math.hypot(p.x - all[i - 1].x, p.y - all[i - 1].y) > 0.55);
  if (route.length < 2) return;

  const trace = () => {
    ctx.beginPath();
    route.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  };

  // The new visual language is a precision trajectory, not a miniature road.
  // One fine luminous filament lets the photograph breathe and keeps the GPX legible.
  const lineWidth = Math.max(1.65, Math.min(3.1, config.lineWidth * 0.68));

  // Soft, close contact shadow gives the filament depth without a broad dark track.
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(0,0,0,0.82)';
  ctx.lineWidth = lineWidth + 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = Math.max(5, height * 0.009);
  ctx.shadowOffsetY = Math.max(1.5, height * 0.0025);
  ctx.stroke();
  ctx.restore();

  // A restrained atmospheric halo, kept narrow so it never reads as a neon tube.
  ctx.save();
  trace();
  ctx.strokeStyle = '#ff672b';
  ctx.lineWidth = lineWidth * 2.4;
  ctx.globalAlpha = 0.16;
  ctx.shadowColor = '#ff5d20';
  ctx.shadowBlur = height * 0.012;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Fine metallic core with a warm-to-cool highlight shift along the route.
  ctx.save();
  trace();
  const filament = ctx.createLinearGradient(route[0].x, route[0].y, route[route.length - 1].x, route[route.length - 1].y);
  filament.addColorStop(0, '#ffe2b4');
  filament.addColorStop(0.28, '#ff9a50');
  filament.addColorStop(0.72, '#ff6428');
  filament.addColorStop(1, '#ffd0a0');
  ctx.strokeStyle = filament;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // A hairline highlight on one side creates a precision-machined, glass-fibre feel.
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(255,248,231,0.78)';
  ctx.lineWidth = Math.max(0.55, lineWidth * 0.24);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Only the endpoints receive hardware-like markers. No arrows, road texture or clutter.
  drawBeacon(ctx, route[0], height, 'START');
  drawBeacon(ctx, route[route.length - 1], height, 'FINISH');
}
function drawBeacon(ctx: CanvasRenderingContext2D, p: Point3, height: number, _label: string) {
  const r = Math.max(3, height * 0.0045);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,220,183,0.92)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff3df';
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawTelemetry(ctx: CanvasRenderingContext2D, width: number, height: number, activity: StravaActivityData, config: HudCardConfig) {
  const portrait = height > width;
  const scale = Math.max(0.72, Math.min(1.12, config.scale));
  const panelW = Math.min(width * (portrait ? 0.76 : 0.34), 330 * scale);
  const panelH = portrait ? 116 : 108;
  const x = Math.max(14, Math.min(width - panelW - 14, width * config.posX));
  const y = Math.max(14, Math.min(height - panelH - 14, height * config.posY));
  const pad = Math.max(13, panelW * 0.065);
  const distance = Number.isFinite(activity.distanceKm) && activity.distanceKm > 0 ? activity.distanceKm.toFixed(1) : '—';
  const title = (config.headerTitle || activity.name || 'ACTIVITY').trim().toUpperCase();
  const defaults = [
    { label: activity.sport === 'cycling' ? 'TIME' : 'DURATION', value: activity.durationFormatted || '—' },
    { label: activity.sport === 'cycling' ? 'AVG SPEED' : 'AVG PACE', value: activity.avgPaceOrSpeed || '—' },
    { label: 'CLIMB', value: Number.isFinite(activity.elevationGainM) ? `+${Math.round(activity.elevationGainM).toLocaleString()} M` : '—' },
  ];
  const metrics = (config.customMetrics?.length
    ? config.customMetrics.filter(m => !/distance/i.test(m.label)).map(m => ({ label: m.label.toUpperCase(), value: m.value }))
    : defaults).filter(m => m.value && m.value !== '—').slice(0, 3);

  ctx.save();
  // Glass is deliberately compact: an instrument readout, not a dashboard.
  roundedRect(ctx, x, y, panelW, panelH, 12);
  ctx.fillStyle = 'rgba(5,12,21,0.68)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(174,213,239,0.34)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ff7130';
  ctx.fillRect(x + 1, y + 12, 2, panelH - 24);

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(205,224,238,0.70)';
  ctx.font = `700 ${Math.max(7, panelW * 0.024)}px Arial, sans-serif`;
  ctx.letterSpacing = '0.17em';
  ctx.fillText(title.slice(0, 30), x + pad, y + 20);

  ctx.fillStyle = '#fff7ec';
  ctx.font = `800 ${Math.min(panelW * 0.18, panelH * 0.43)}px Arial, sans-serif`;
  ctx.letterSpacing = '-0.04em';
  ctx.fillText(distance, x + pad - 1, y + 65);
  const distanceW = ctx.measureText(distance).width;
  ctx.fillStyle = '#ff8545';
  ctx.font = `700 ${Math.max(9, panelW * 0.035)}px Arial, sans-serif`;
  ctx.letterSpacing = '0.12em';
  ctx.fillText('KM', x + pad + distanceW + 5, y + 63);

  const divider = y + 77;
  ctx.strokeStyle = 'rgba(190,215,235,0.18)';
  ctx.beginPath();
  ctx.moveTo(x + pad, divider);
  ctx.lineTo(x + panelW - pad, divider);
  ctx.stroke();
  const gap = 10;
  const colW = (panelW - pad * 2 - gap * 2) / 3;
  metrics.forEach((m, i) => {
    const mx = x + pad + i * (colW + gap);
    ctx.fillStyle = 'rgba(193,216,232,0.58)';
    ctx.font = `600 ${Math.max(6, panelW * 0.018)}px Arial, sans-serif`;
    ctx.letterSpacing = '0.10em';
    ctx.fillText(m.label.slice(0, 13), mx, y + 91);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.max(8, panelW * 0.026)}px Arial, sans-serif`;
    ctx.letterSpacing = '0';
    ctx.fillText(m.value, mx, y + 103);
  });
  ctx.restore();
}

function drawElevation(ctx: CanvasRenderingContext2D, width: number, height: number, activity: StravaActivityData, config: ElevationOverlayConfig) {
  const profile = activity.elevationProfile;
  if (!profile || profile.length < 2) return;
  const x = width * 0.08;
  const w = width * 0.84;
  const h = Math.max(14, Math.min(height * 0.05, config.height * 0.72));
  const baseline = height * Math.min(0.96, Math.max(0.82, config.posY));
  const min = Math.min(...profile.map(p => p.elevationM));
  const max = Math.max(...profile.map(p => p.elevationM));
  const span = Math.max(1, max - min);
  const points = profile.map(p => ({
    x: x + (p.distanceKm / Math.max(0.001, activity.distanceKm || profile[profile.length - 1].distanceKm)) * w,
    y: baseline - ((p.elevationM - min) / span) * h,
  }));
  ctx.save();
  ctx.globalAlpha = Math.max(0.25, Math.min(0.7, config.opacity * 0.62));
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = '#ff9a59';
  ctx.lineWidth = Math.max(1, width * 0.0012);
  ctx.shadowColor = '#ff6b2c';
  ctx.shadowBlur = 5;
  ctx.stroke();
  ctx.restore();
}

function drawBrand(ctx: CanvasRenderingContext2D, width: number, height: number, corner: LogoCorner) {
  const pad = Math.max(14, width * 0.025);
  const text = 'gpx.photos';
  ctx.save();
  ctx.font = `700 ${Math.max(12, width * 0.019)}px Arial, sans-serif`;
  const tw = ctx.measureText(text).width;
  const x = corner.endsWith('left') ? pad : width - tw - pad;
  const y = corner.startsWith('bottom') ? height - pad : pad + Math.max(12, width * 0.019);
  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 5;
  ctx.fillText('gpx', x, y);
  const gx = ctx.measureText('gpx').width;
  ctx.fillStyle = '#ff7130';
  ctx.fillText('.', x + gx, y);
  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.fillText('photos', x + gx + ctx.measureText('.').width, y);
  ctx.restore();
}
