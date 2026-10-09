export type SportType = 'cycling' | 'running' | 'trail' | 'triathlon' | 'hiking' | 'expedition';

export interface RoutePoint {
  x: number; // 0 to 1 normalized coordinates
  y: number; // 0 to 1 normalized coordinates
  elevation?: number;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

export interface ActivityData {
  id: string;
  name: string;
  location: string;
  date: string;
  sport: SportType;
  distanceKm: number;
  durationFormatted: string; // e.g. "2:48:23"
  avgPaceOrSpeed: string; // e.g. "34.7 km/h" or "4:07 /km"
  elevationGainM: number;
  elevationLossM?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPowerWatts?: number;
  calories?: number;
  athleteName: string;
  bibNumber?: string;
  customQuote: string;
  coordinates: RoutePoint[];
  elevationProfile: ElevationPoint[];
}

export type StravaActivityData = ActivityData;

export type RouteRenderMode = 'volumetric_tube' | 'laser_ribbon' | 'archival_shadow' | 'minimal_vector';

export interface SpatialRouteConfig {
  tiltAngle: number; // Ground perspective pitch: 0 to 85 deg (0 = flat 2D overhead)
  yawAngle: number; // Rotation on ground plane: 0 to 360 deg
  scale: number; // 0.4 to 2.0
  posX: number; // 0.1 to 0.9 (canvas normalized position)
  posY: number; // 0.3 to 0.95
  perspectiveDepth: number; // 0.2 to 1.0 (vanishing point compression)
  glowColor: string; // e.g. "#FC5200" Strava orange
  glowIntensity: number; // 0.0 to 2.5
  glowEnabled?: boolean; // Toggle glow on/off
  lineWidth: number; // 1 to 14
  // 3D Visualization Pipeline properties:
  renderMode?: RouteRenderMode; // 'volumetric_tube' | 'laser_ribbon' | 'archival_shadow' | 'minimal_vector'
  shadowEnabled?: boolean; // Ground contact drop shadow
  shadowIntensity?: number; // 0.0 to 1.0
  shadowOffsetY?: number; // Ground shadow offset in px
  elevation3dScale?: number; // 0.0 to 1.5 (lifts route based on elevation profile)
  depthTapering?: boolean; // Perspective width tapering & aerial haze
  tubeSpecular?: boolean; // Cylindrical specular ridge highlight
}

export type HudOrientation = 'straight' | 'slanted_left' | 'slanted_right' | 'custom';

export interface HudCustomMetric {
  id: string;
  label: string;
  value: string;
}

export interface HudCardConfig {
  enabled: boolean;
  style: 'smoked_glass' | 'frosted_ice' | 'carbon_fiber' | 'neon_rim';
  orientation: HudOrientation;
  posX: number; // normalized 0.05 to 0.95
  posY: number; // normalized 0.05 to 0.95
  scale: number; // 0.7 to 1.5
  tiltY: number; // 3D perspective slant: -40 to 40 deg (0 = completely straight)
  tiltX: number; // 3D pitch: 0 to 45 deg (0 = completely straight)
  showHeader?: boolean; // Toggle header display
  headerTitle?: string; // Customizable event / race title (e.g. "CAPE EPIC", "BERLIN MARATHON")
  headerYear?: string; // Customizable event year / date (e.g. "2026")
  showStravaLogo?: boolean; // legacy compatibility
  opacity: number; // 0.6 to 1.0
  glassThickness: number; // 1 to 5 (for 3D edge depth and bevel)
  glassmorphismIntensity?: number; // 0 to 100: glassmorphic blur radius & translucency
  customMetrics?: HudCustomMetric[];
}

export interface ElevationOverlayConfig {
  enabled: boolean;
  posY: number; // 0.60 to 0.98 (vertical placement on canvas)
  height: number; // height in base pixels (30 to 120)
  style: 'glass_ribbon' | 'minimal_line';
  opacity: number; // 0.3 to 1.0
  showLabels: boolean; // show start/peak elevation labels
  widthPercent: number; // 0.5 to 0.95
}

export interface PhotoAtmosphereConfig {
  grade: 'golden_hour' | 'natural_warm' | 'cyber_twilight' | 'high_contrast' | 'original';
  brightness: number; // 0.8 to 1.3
  contrast: number; // 0.8 to 1.4
  warmth: number; // -30 to +40
}

export type LogoCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type FrameType = 'unframed' | 'oak' | 'black' | 'white' | 'canvas_wrap';

export interface PrintSize {
  id: string;
  name: string;
  dimensionsInches: string;
  dimensionsCm: string;
  aspectRatio: number;
  basePrice: number;
}
