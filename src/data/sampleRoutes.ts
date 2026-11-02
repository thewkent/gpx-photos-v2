import { StravaActivityData, PrintSize, SpatialRouteConfig, HudCardConfig, PhotoAtmosphereConfig, ElevationOverlayConfig } from '../types/poster';

export const ASSETS = {
  sydneyMarathon: '/assets/images/sydney_marathon_photo_1791548122129.jpg',
  roadMarathoner: '/assets/images/road_marathoner_tarmac_1790956451444.jpg',
  rideJoburgCyclist: '/assets/images/ride_joburg_cyclist_1790956433993.jpg',
  trailSummit: '/assets/images/athlete_trail_summit_1790954952107.jpg',
  roomMockup: '/assets/images/room_mockup_wall_1790954976364.jpg',
};

// Sydney Marathon Iconic Route Coordinates Loop
// (North Sydney -> Sydney Harbour Bridge -> The Rocks -> Barangaroo -> Pyrmont -> Centennial Park / Oxford St -> Circular Quay -> Sydney Opera House Forecourt Finish)
const defaultRouteCoords = [
  { x: 0.28, y: 0.16 }, // North Sydney Start / Miller St
  { x: 0.32, y: 0.22 },
  { x: 0.35, y: 0.28 }, // Bradfield Hwy Approach
  { x: 0.36, y: 0.36 }, // Sydney Harbour Bridge Deck
  { x: 0.38, y: 0.44 }, // Bridge Pylons & Cahill Expressway
  { x: 0.34, y: 0.50 }, // The Rocks / Hickson Rd
  { x: 0.26, y: 0.54 }, // Barangaroo Foreshore
  { x: 0.20, y: 0.62 }, // Darling Harbour / Pyrmont
  { x: 0.24, y: 0.70 }, // Ultimo / Broadway
  { x: 0.34, y: 0.76 }, // Haymarket / Chinatown
  { x: 0.46, y: 0.82 }, // Surry Hills
  { x: 0.58, y: 0.86 }, // Anzac Parade
  { x: 0.70, y: 0.84 }, // Moore Park
  { x: 0.82, y: 0.78 }, // Centennial Park Grand Drive Loop
  { x: 0.86, y: 0.68 },
  { x: 0.80, y: 0.58 }, // Returning via Oxford St
  { x: 0.68, y: 0.50 }, // Paddington / Taylor Square
  { x: 0.58, y: 0.44 }, // Hyde Park / College St
  { x: 0.52, y: 0.38 }, // Art Gallery Rd / Mrs Macquaries Chair
  { x: 0.56, y: 0.32 }, // Royal Botanic Garden
  { x: 0.48, y: 0.24 }, // Circular Quay
  { x: 0.44, y: 0.18 }, // Sydney Opera House Forecourt Finish
];

// Elevation profile for Sydney Marathon (42.195 km, undulating Harbour Bridge & Centennial Park)
const defaultElevationProfile = [
  { distanceKm: 0, elevationM: 58 },
  { distanceKm: 3.5, elevationM: 64 }, // Harbour Bridge crest
  { distanceKm: 8.2, elevationM: 8 },  // Barangaroo water level
  { distanceKm: 14.0, elevationM: 26 }, // Pyrmont / Darling Harbour
  { distanceKm: 21.1, elevationM: 42 }, // Halfway Oxford St
  { distanceKm: 28.5, elevationM: 48 }, // Centennial Park rise
  { distanceKm: 35.0, elevationM: 32 }, // Return down College St
  { distanceKm: 40.0, elevationM: 18 }, // Botanic Gardens
  { distanceKm: 42.2, elevationM: 6 },  // Sydney Opera House Finish
];

export const DEFAULT_ACTIVITY: StravaActivityData = {
  id: 'sydney-marathon',
  name: 'Sydney Marathon 2026',
  location: 'Sydney Harbour & Opera House, Australia',
  date: 'September 20, 2026',
  sport: 'running',
  distanceKm: 42.2,
  durationFormatted: '3:14:26',
  avgPaceOrSpeed: '4:36 /km',
  elevationGainM: 318,
  athleteName: 'Athlete',
  bibNumber: '8122',
  customQuote: 'Crossing the Sydney Harbour Bridge to the Opera House finish line.',
  coordinates: defaultRouteCoords,
  elevationProfile: defaultElevationProfile,
};

export const SAMPLE_ACTIVITIES: StravaActivityData[] = [DEFAULT_ACTIVITY];

export const DEFAULT_SPATIAL_CONFIG: SpatialRouteConfig = {
  tiltAngle: 0, // Flat 2D by default
  yawAngle: 0,
  scale: 1.0,
  posX: 0.72, // Centered right
  posY: 0.52,
  perspectiveDepth: 0.65,
  glowColor: '#FC5200', // Signature GPX Orange
  glowIntensity: 0.85,
  glowEnabled: true,
  lineWidth: 2.8,
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
  style: 'neon_rim',
  orientation: 'straight',
  posX: 0.16, // Bottom left
  posY: 0.76, // Bottom left
  scale: 1.0,
  tiltY: 0,
  tiltX: 0,
  showHeader: true,
  headerTitle: 'SYDNEY MARATHON',
  showStravaLogo: true,
  opacity: 0.94,
  glassThickness: 3,
  glassmorphismIntensity: 75,
  customMetrics: [
    { id: 'm1', label: 'Distance:', value: '42.2 km' },
    { id: 'm2', label: 'Time:', value: '3:14:26' },
    { id: 'm3', label: 'Elevation Gain:', value: '318 m' },
    { id: 'm4', label: 'Ave Pace:', value: '4:36 /km' },
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
