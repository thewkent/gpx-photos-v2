import type { ElevationOverlayConfig, HudCardConfig, RoutePoint, SpatialRouteConfig } from '../types/poster';

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutePlacement {
  posX: number;
  posY: number;
  scale: number;
}

interface PlacementOptions {
  points: RoutePoint[];
  aspect: number;
  preferred: RoutePlacement;
  noGoZones?: NormalizedRect[];
  hudCard?: Partial<HudCardConfig>;
  elevationConfig?: Partial<ElevationOverlayConfig>;
  fitWithin?: NormalizedRect;
  complexityGrid?: number[];
}

function intersects(a: NormalizedRect, b: NormalizedRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

function contains(outer: NormalizedRect, inner: NormalizedRect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height;
}

function complexityCost(bounds: NormalizedRect, grid?: number[]): number {
  if (!grid || grid.length !== 16) return 0;
  let total = 0;
  let area = 0;
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      const cell = { x: column / 4, y: row / 4, width: 0.25, height: 0.25 };
      const overlapWidth = Math.max(0, Math.min(bounds.x + bounds.width, cell.x + cell.width) - Math.max(bounds.x, cell.x));
      const overlapHeight = Math.max(0, Math.min(bounds.y + bounds.height, cell.y + cell.height) - Math.max(bounds.y, cell.y));
      const overlapArea = overlapWidth * overlapHeight;
      total += (grid[row * 4 + column] ?? 0) * overlapArea;
      area += overlapArea;
    }
  }
  return area > 0 ? total / area : 0;
}

function getRouteBounds(points: RoutePoint[], placement: RoutePlacement, aspect: number): NormalizedRect {
  const pitch = (14 * Math.PI) / 180;
  const sinPitch = Math.sin(pitch);
  const cosPitch = Math.cos(pitch);
  const elevations = points.map((point) => point.elevation ?? 0);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);

  const projected = points.map((point, index) => {
    const relX = point.x - 0.5;
    const relY = point.y - 0.5;
    const normalizedElevation = maxElevation > minElevation
      ? ((point.elevation ?? minElevation) - minElevation) / (maxElevation - minElevation)
      : 0.5 + 0.5 * Math.sin((index / Math.max(1, points.length - 1)) * Math.PI * 2 - Math.PI / 2);
    const elev3d = 0.35 * normalizedElevation * 0.16 * sinPitch;
    const groundY = relY * cosPitch - elev3d;
    const groundZ = (relY + elev3d * 0.5) * sinPitch;
    const depth = 1 / Math.max(0.1, 1 + groundZ * 0.65 * sinPitch);
    const scale = 0.55 * placement.scale;
    return {
      x: placement.posX + relX * scale * depth,
      y: placement.posY + groundY * scale * aspect * depth,
    };
  });

  const paddingX = 14 / 960;
  const paddingY = paddingX * aspect;
  const xs = projected.map((point) => point.x);
  const ys = projected.map((point) => point.y);
  const left = Math.min(...xs) - paddingX;
  const top = Math.min(...ys) - paddingY;
  const right = Math.max(...xs) + paddingX;
  const bottom = Math.max(...ys) + paddingY;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function getHudBounds(hudCard: Partial<HudCardConfig> | undefined): NormalizedRect | null {
  if (!hudCard || hudCard.enabled === false) return null;
  const scale = hudCard.scale ?? 1;
  return {
    x: hudCard.posX ?? 0.14,
    y: hudCard.posY ?? 0.14,
    width: (270 * scale) / 960,
    height: (182 * scale) / 960,
  };
}

function getElevationBounds(config: Partial<ElevationOverlayConfig> | undefined, aspect: number): NormalizedRect | null {
  if (!config || config.enabled === false) return null;
  const width = config.widthPercent ?? 0.9;
  const height = ((config.height ?? 52) / 960) * aspect;
  return { x: (1 - width) / 2, y: (config.posY ?? 0.92) - height, width, height };
}

export function chooseAutoRoutePlacement(options: PlacementOptions): RoutePlacement {
  const { points, aspect, preferred, noGoZones = [] } = options;
  if (points.length === 0 || !Number.isFinite(aspect) || aspect <= 0) return preferred;

  const obstacles = [
    ...noGoZones.map((zone) => ({
      x: zone.x - 0.015,
      y: zone.y - 0.015,
      width: zone.width + 0.03,
      height: zone.height + 0.03,
    })),
    getHudBounds(options.hudCard),
    getElevationBounds(options.elevationConfig, aspect),
  ].filter((rect): rect is NormalizedRect => rect !== null);
  const positions = [
    { posX: preferred.posX, posY: preferred.posY },
    { posX: 0.24, posY: 0.24 },
    { posX: 0.76, posY: 0.24 },
    { posX: 0.24, posY: 0.48 },
    { posX: 0.76, posY: 0.48 },
    { posX: 0.5, posY: 0.22 },
    { posX: 0.5, posY: 0.50 },
    { posX: 0.24, posY: 0.72 },
    { posX: 0.76, posY: 0.72 },
  ];
  const minScale = Math.min(0.42, preferred.scale);
  const scales: number[] = [];
  for (let scale = preferred.scale; scale > minScale; scale = Math.round((scale - 0.05) * 100) / 100) {
    scales.push(scale);
  }
  scales.push(minScale);

  for (const scale of scales) {
    const candidates = positions.map((position, index) => ({
      ...position,
      scale,
      preferenceCost: index === 0 ? 0 : Math.hypot(position.posX - preferred.posX, position.posY - preferred.posY),
      isPreferred: index === 0,
    }));
    const preferredBounds = getRouteBounds(points, candidates[0], aspect);
    const preferredFitsBox = !options.fitWithin || contains(options.fitWithin, preferredBounds);
    const validCandidates = candidates.flatMap((candidate) => {
      const bounds = getRouteBounds(points, candidate, aspect);
      const inBounds = bounds.x >= 0.035 && bounds.y >= 0.035 &&
        bounds.x + bounds.width <= 0.965 && bounds.y + bounds.height <= 0.965;
      const fitsBox = !options.fitWithin || preferredFitsBox;
      const collides = obstacles.some((obstacle) => intersects(bounds, obstacle));
      if (!inBounds || !fitsBox || collides) return [];
      return [{ candidate, cost: complexityCost(bounds, options.complexityGrid) + candidate.preferenceCost * 24 }];
    }).sort((a, b) => a.cost - b.cost);

    if (validCandidates.length) {
      const { candidate } = validCandidates[0];
      return { posX: candidate.posX, posY: candidate.posY, scale: candidate.scale };
    }
  }

  return { ...preferred, scale: Math.min(preferred.scale, minScale) };
}

export function isRoutePlacementClear(
  points: RoutePoint[],
  placement: RoutePlacement,
  aspect: number,
  noGoZones: NormalizedRect[] = []
): boolean {
  const bounds = getRouteBounds(points, placement, aspect);
  const inBounds = bounds.x >= 0.035 && bounds.y >= 0.035 &&
    bounds.x + bounds.width <= 0.965 && bounds.y + bounds.height <= 0.965;
  return inBounds && noGoZones.every((zone) => !intersects(bounds, zone));
}

export function toRoutePlacement(route: Partial<SpatialRouteConfig>): RoutePlacement {
  return {
    posX: route.posX ?? 0.72,
    posY: route.posY ?? 0.28,
    scale: route.scale ?? 0.8,
  };
}
