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
 * Signature renderer: editorial photo composition with a perspective-ground route.
 * This is intentionally independent of the Classic renderer so both can evolve safely.
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
  drawPerspectiveRoute(ctx, width, height, activity, spatialRoute);
  if (hudCard.enabled) drawTelemetryPanel(ctx, width, height, activity, hudCard);
  if (elevationConfig?.enabled && activity.elevationProfile?.length > 1) {
    drawElevation(ctx, width, height, activity, elevationConfig);
  }
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
  ctx.fillStyle = '#15191d';
  ctx.fillRect(0, 0, width, height);
  if (image?.complete && image.naturalWidth > 0) {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    const brightness = Math.max(0.5, Math.min(1.5, atmosphere.brightness));
    const contrast = Math.max(0.5, Math.min(1.6, atmosphere.contrast));
    ctx.save();
    ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
    ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    ctx.restore();
  }

  // A restrained lower fade gives the route visual separation without grading the photo.
  const fade = ctx.createLinearGradient(0, height * 0.42, 0, height);
  fade.addColorStop(0, 'rgba(7, 10, 14, 0)');
  fade.addColorStop(0.58, 'rgba(7, 10, 14, 0.10)');
  fade.addColorStop(1, 'rgba(7, 10, 14, 0.42)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);
}

interface ProjectedPoint { x: number; y: number; depth: number; elevation: number; }

function drawPerspectiveRoute(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  config: SpatialRouteConfig,
) {
  const coords = activity.coordinates;
  if (!coords || coords.length < 2) return;

  const elevations = coords.map((p) => p.elevation).filter((v): v is number => Number.isFinite(v));
  const minElevation = elevations.length ? Math.min(...elevations) : 0;
  const maxElevation = elevations.length ? Math.max(...elevations) : 0;
  const yaw = (config.yawAngle * Math.PI) / 180;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const pitch = Math.max(0.28, Math.min(0.92, Math.sin((Math.max(18, config.tiltAngle) * Math.PI) / 180)));
  const projected: ProjectedPoint[] = coords.map((point, index) => {
    const px = point.x - 0.5;
    const py = point.y - 0.5;
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    const depth = Math.max(0, Math.min(1, point.y));
    // The near edge of the route plane is larger; the far edge recedes naturally.
    const perspective = 0.68 + depth * 0.48;
    const elevation = point.elevation !== undefined && maxElevation > minElevation
      ? (point.elevation - minElevation) / (maxElevation - minElevation)
      : 0;
    const lift = elevation * (config.elevation3dScale ?? 0.22) * height * 0.035 * pitch;
    return {
      x: width * 0.5 + rx * width * 0.43 * perspective * config.scale,
      y: height * (0.56 + ry * 0.58 * pitch) - lift,
      depth,
      elevation,
    };
  });

  const path = () => {
    ctx.beginPath();
    projected.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  };
  const baseWidth = Math.max(2.2, Math.min(7.5, config.lineWidth * 1.25));
  const color = '#ff641f';

  // Ground-contact shadow: offset and softened, separate from the luminous route body.
  ctx.save();
  ctx.translate(2, Math.max(3, height * 0.009));
  path();
  ctx.strokeStyle = 'rgba(0,0,0,0.78)';
  ctx.lineWidth = baseWidth * 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = Math.max(8, height * 0.018);
  ctx.stroke();
  ctx.restore();

  // Soft ambient reflection, deliberately much quieter than a neon tube.
  ctx.save();
  path();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = color;
  ctx.lineWidth = baseWidth * 3.4;
  ctx.globalAlpha = 0.28 * Math.max(0.2, config.glowIntensity);
  ctx.shadowColor = color;
  ctx.shadowBlur = height * 0.025;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Dark dimensional underside.
  ctx.save();
  path();
  ctx.strokeStyle = '#713014';
  ctx.lineWidth = baseWidth * 1.85;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.stroke();
  ctx.restore();

  // Warm orange route body.
  ctx.save();
  path();
  const body = ctx.createLinearGradient(0, height * 0.42, 0, height * 0.92);
  body.addColorStop(0, '#ffd08a');
  body.addColorStop(0.35, '#ff8a32');
  body.addColorStop(1, '#e84b0c');
  ctx.strokeStyle = body;
  ctx.lineWidth = baseWidth * 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Fine specular edge, not a white-hot centre line.
  ctx.save();
  path();
  ctx.strokeStyle = 'rgba(255,239,211,0.78)';
  ctx.lineWidth = Math.max(0.8, baseWidth * 0.22);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  drawRouteMarker(ctx, projected[0], '#fff0d5', color, height);
  drawRouteMarker(ctx, projected[projected.length - 1], '#ffffff', '#ff641f', height);
}

function drawRouteMarker(
  ctx: CanvasRenderingContext2D,
  point: ProjectedPoint,
  core: string,
  edge: string,
  height: number,
) {
  const radius = Math.max(4, height * 0.007);
  ctx.save();
  ctx.shadowColor = edge;
  ctx.shadowBlur = radius * 2.4;
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  width: number, height: number, radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawTelemetryPanel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  config: HudCardConfig,
) {
  const portrait = height > width;
  const scale = Math.max(0.72, Math.min(1.15, config.scale));
  const panelW = Math.min(width * (portrait ? 0.72 : 0.43), 410 * scale);
  const rowH = Math.max(27, height * 0.043);
  const title = (config.headerTitle || activity.name || 'ACTIVITY').trim();
  const configuredMetrics = config.customMetrics;
  const metrics = (configuredMetrics?.length
    ? configuredMetrics.map((item) => ({ label: item.label.replace(/:$/, '').toUpperCase(), value: item.value }))
    : [
        { label: 'DISTANCE', value: Number.isFinite(activity.distanceKm) ? `${activity.distanceKm.toFixed(1)} km` : '' },
        { label: 'MOVING TIME', value: activity.durationFormatted || '' },
        { label: 'ELEVATION GAIN', value: Number.isFinite(activity.elevationGainM) ? `+${Math.round(activity.elevationGainM).toLocaleString()} m` : '' },
        { label: activity.sport === 'cycling' ? 'AVG SPEED' : 'AVG PACE', value: activity.avgPaceOrSpeed || '' },
      ])
    .filter((item) => item.label && item.value)
    .slice(0, 4);
  const showHeader = config.showHeader !== false;
  const headerH = showHeader ? 62 : 22;
  const panelH = 20 + headerH + rowH * metrics.length + 14;
  const panelX = Math.max(16, Math.min(width - panelW - 16, width * config.posX));
  const panelY = Math.max(16, Math.min(height - panelH - 18, height * config.posY));
  const radius = Math.max(12, width * 0.012);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.42)';
  ctx.shadowBlur = height * 0.025;
  ctx.shadowOffsetY = height * 0.008;
  roundedRect(ctx, panelX, panelY, panelW, panelH, radius);
  const glass = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
  glass.addColorStop(0, 'rgba(13,18,24,0.78)');
  glass.addColorStop(0.55, 'rgba(20,25,31,0.62)');
  glass.addColorStop(1, 'rgba(7,11,16,0.72)');
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, panelX, panelY, panelW, panelH, radius);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ff6a24';
  roundedRect(ctx, panelX + 1, panelY + 13, 3, panelH - 26, 2);
  ctx.fill();

  const pad = Math.max(15, panelW * 0.075);
  const titleSize = Math.max(11, Math.min(19, panelW * 0.047));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let dividerY = panelY + 18;
  if (showHeader) {
    ctx.fillStyle = 'rgba(255,255,255,0.56)';
    ctx.font = `600 ${Math.max(8, titleSize * 0.52)}px Arial, sans-serif`;
    ctx.letterSpacing = '0.17em';
    ctx.fillText('ACTIVITY', panelX + pad, panelY + 23);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${titleSize}px Arial, sans-serif`;
    ctx.letterSpacing = '0.01em';
    let shortTitle = title;
    while (ctx.measureText(shortTitle).width > panelW - pad * 2 && shortTitle.length > 8) {
      shortTitle = shortTitle.slice(0, -2);
    }
    ctx.fillText(shortTitle, panelX + pad, panelY + 44);
    dividerY = panelY + 57;
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.moveTo(panelX + pad, dividerY);
  ctx.lineTo(panelX + panelW - pad, dividerY);
  ctx.stroke();

  metrics.forEach((metric, index) => {
    const y = dividerY + 18 + index * rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.57)';
    ctx.font = `600 ${Math.max(8, titleSize * 0.53)}px Arial, sans-serif`;
    ctx.letterSpacing = '0.10em';
    ctx.fillText(metric.label, panelX + pad, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.max(11, titleSize * 0.78)}px Arial, sans-serif`;
    ctx.letterSpacing = '0';
    ctx.fillText(metric.value, panelX + panelW - pad, y);
  });
  ctx.restore();
}

function drawElevation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: StravaActivityData,
  config: ElevationOverlayConfig,
) {
  const profile = activity.elevationProfile;
  if (!profile || profile.length < 2) return;
  const x = width * 0.08;
  const w = width * 0.84;
  const h = Math.max(18, Math.min(height * 0.075, config.height));
  const baseline = height * Math.min(0.96, Math.max(0.78, config.posY));
  const min = Math.min(...profile.map((p) => p.elevationM));
  const max = Math.max(...profile.map((p) => p.elevationM));
  const span = Math.max(1, max - min);
  const points = profile.map((p) => ({
    x: x + (p.distanceKm / Math.max(0.001, activity.distanceKm || profile[profile.length - 1].distanceKm)) * w,
    y: baseline - ((p.elevationM - min) / span) * h,
  }));

  ctx.save();
  ctx.globalAlpha = Math.max(0.35, Math.min(1, config.opacity));
  const fill = ctx.createLinearGradient(0, baseline - h, 0, baseline);
  fill.addColorStop(0, 'rgba(255,111,43,0.32)');
  fill.addColorStop(1, 'rgba(255,111,43,0)');
  ctx.beginPath();
  ctx.moveTo(points[0].x, baseline);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, baseline);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = '#ff9a58';
  ctx.lineWidth = Math.max(1.4, width * 0.0018);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#ff641f';
  ctx.shadowBlur = 8;
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
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 5;
  ctx.fillText('gpx', x, y);
  const gx = ctx.measureText('gpx').width;
  ctx.fillStyle = '#ff6a24';
  ctx.fillText('.', x + gx, y);
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText('photos', x + gx + ctx.measureText('.').width, y);
  ctx.restore();
}
