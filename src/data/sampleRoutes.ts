import { StravaActivityData, PrintSize, SpatialRouteConfig, HudCardConfig, PhotoAtmosphereConfig, ElevationOverlayConfig } from '../types/poster';

export const ASSETS = {
  rideJoburgCyclist: '/src/assets/images/ride_joburg_cyclist_1790956433993.jpg',
  roadMarathoner: '/src/assets/images/road_marathoner_tarmac_1790956451444.jpg',
  trailSummit: '/src/assets/images/athlete_trail_summit_1790954952107.jpg',
  roomMockup: '/src/assets/images/room_mockup_wall_1790954976364.jpg',
};

// Default route coordinates loop
const defaultRouteCoords = [
  { x: 0.15, y: 0.65 },
  { x: 0.12, y: 0.72 },
  { x: 0.16, y: 0.82 },
  { x: 0.22, y: 0.88 },
  { x: 0.32, y: 0.85 },
  { x: 0.40, y: 0.76 },
  { x: 0.48, y: 0.68 },
  { x: 0.52, y: 0.62 },
  { x: 0.58, y: 0.52 },
  { x: 0.64, y: 0.45 },
  { x: 0.70, y: 0.38 },
  { x: 0.78, y: 0.30 },
  { x: 0.88, y: 0.25 },
  { x: 0.94, y: 0.28 },
  { x: 0.95, y: 0.38 },
  { x: 0.90, y: 0.48 },
  { x: 0.84, y: 0.52 },
  { x: 0.74, y: 0.54 },
  { x: 0.65, y: 0.60 },
  { x: 0.54, y: 0.70 },
  { x: 0.44, y: 0.78 },
  { x: 0.34, y: 0.84 },
  { x: 0.25, y: 0.80 },
  { x: 0.18, y: 0.74 },
  { x: 0.15, y: 0.65 },
];

const defaultElevationProfile = [
  { distanceKm: 0, elevationM: 1420 },
  { distanceKm: 18, elevationM: 1490 },
  { distanceKm: 35, elevationM: 1380 },
  { distanceKm: 55, elevationM: 1540 },
  { distanceKm: 72, elevationM: 1680 },
  { distanceKm: 84.2, elevationM: 1450 },
];

export const DEFAULT_ACTIVITY: StravaActivityData = {
  id: 'current-activity',
  name: 'Grand Fondo & Peak Pass',
  location: 'Mountain Pass Circuit',
  date: 'October 24, 2026',
  sport: 'cycling',
  distanceKm: 84.2,
  durationFormatted: '2:26:45',
  avgPaceOrSpeed: '34.4 km/h',
  elevationGainM: 1120,
  athleteName: 'Athlete',
  bibNumber: '1042',
  customQuote: 'Earned every meter of elevation across the mountain pass.',
  coordinates: defaultRouteCoords,
  elevationProfile: defaultElevationProfile,
};

export const SAMPLE_ACTIVITIES: StravaActivityData[] = [DEFAULT_ACTIVITY];

export const DEFAULT_SPATIAL_CONFIG: SpatialRouteConfig = {
  tiltAngle: 0, // By default render flat 0
  yawAngle: 0, // By default render yaw 0
  scale: 1.0,
  posX: 0.72, // Default to middle right
  posY: 0.52, // Default to middle vertically
  perspectiveDepth: 0.65,
  glowColor: '#FC5200', // Signature GPX Orange
  glowIntensity: 0.85, // Calibrated so it never merges into one solid blob
  glowEnabled: true, // Toggle glow on/off
  lineWidth: 2.8, // Crisp defined line matching reference photo
  renderMode: 'volumetric_tube',
  shadowEnabled: true,
  shadowIntensity: 0.65,
  shadowOffsetY: 4,
  elevation3dScale: 0.35,
  depthTapering: true,
  tubeSpecular: true,
};

export const DEFAULT_HUD_CONFIG: HudCardConfig = {
  enabled: true,
  style: 'smoked_glass',
  orientation: 'straight', // By default flat and straight
  posX: 0.16, // Bottom left
  posY: 0.76, // Bottom left
  scale: 1.0,
  tiltY: 0, // Flat 0
  tiltX: 0, // Flat 0
  showHeader: true,
  headerTitle: 'GRAND FONDO',
  headerYear: '2026',
  showStravaLogo: true, // legacy compatibility
  opacity: 0.94,
  glassThickness: 3,
  glassmorphismIntensity: 75,
  customMetrics: [
    { id: 'm1', label: 'Distance:', value: '84.2 km' },
    { id: 'm2', label: 'Time:', value: '2:26:45' },
    { id: 'm3', label: 'Elevation Gain:', value: '1,120 m' },
    { id: 'm4', label: 'Ave Speed:', value: '34.4 km/h' },
  ],
};

export const DEFAULT_ELEVATION_CONFIG: ElevationOverlayConfig = {
  enabled: true,
  posY: 0.92, // At the bottom of the screen (customizable up/down)
  height: 52, // Sleek elevation ribbon
  style: 'glass_ribbon',
  opacity: 0.85,
  showLabels: true,
  widthPercent: 0.90,
};

export const DEFAULT_ATMOSPHERE_CONFIG: PhotoAtmosphereConfig = {
  grade: 'original',
  brightness: 1.0,
  contrast: 1.0,
  warmth: 0,
};

export const PRINT_SIZES: PrintSize[] = [
  {
    id: 'native_photo',
    name: 'Original Photo (100% Uncropped)',
    dimensionsInches: 'Original Ratio',
    dimensionsCm: 'Full Bleed',
    aspectRatio: 0, // dynamic 0 = matches photo exactly
    basePrice: 58,
  },
  {
    id: 'size_16x9',
    name: 'Cinematic 16:9 Art',
    dimensionsInches: '24 × 16 in',
    dimensionsCm: '60 × 40 cm',
    aspectRatio: 16 / 9,
    basePrice: 58,
  },
  {
    id: 'size_3x2',
    name: 'Classic 3:2 Photographic',
    dimensionsInches: '30 × 20 in',
    dimensionsCm: '75 × 50 cm',
    aspectRatio: 3 / 2,
    basePrice: 68,
  },
  {
    id: 'size_4x3',
    name: 'Gallery 4:3 Canvas',
    dimensionsInches: '24 × 18 in',
    dimensionsCm: '60 × 45 cm',
    aspectRatio: 4 / 3,
    basePrice: 54,
  },
  {
    id: 'size_1x1',
    name: 'Square Minimalist',
    dimensionsInches: '20 × 20 in',
    dimensionsCm: '50 × 50 cm',
    aspectRatio: 1,
    basePrice: 50,
  },
];
