import {
  StravaActivityData,
  SpatialRouteConfig,
  HudCardConfig,
  ElevationOverlayConfig,
  PhotoAtmosphereConfig,
} from '../types/poster';
import { ASSETS } from './sampleRoutes';

export interface EventPreset {
  slug: string; // e.g. 'ride-joburg', 'sydney-marathon'
  name: string; // 'Virgin Active Ride Joburg'
  shortName: string; // 'Ride Joburg'
  discipline: 'cycling' | 'running' | 'trail' | 'triathlon' | 'hiking';
  disciplineLabel: string; // 'Road Cycling (Gran Fondo)'
  date: string; // 'November 15, 2026'
  location: 'FNB Stadium, Johannesburg, South Africa' | string;
  distanceKm: number; // 97
  elevationGainM: number; // 1398
  tagline: string;
  heroHeadline: string;
  description: string;
  courseHighlights: string[];
  samplePhotoUrl: string;
  sampleActivity: StravaActivityData;
  spatialPreset: SpatialRouteConfig;
  hudPreset: HudCardConfig;
  elevationPreset?: ElevationOverlayConfig;
  atmospherePreset?: PhotoAtmosphereConfig;
  faqs: { q: string; a: string }[];
}

// Official Virgin Active Ride Joburg Course Coordinates (Parsed directly from official RJ26_Route96km.gpx)
// FNB Stadium Start -> M1 Highway -> Kyalami Grand Prix Circuit -> Cedar Rd -> Steyn City Spine -> Witkoppen -> Nelson Mandela Bridge -> FNB Stadium Finish
const rideJoburgCoords = [
  { x: 0.5119, y: 0.08 },
  { x: 0.4192, y: 0.1439 },
  { x: 0.3124, y: 0.1961 },
  { x: 0.2872, y: 0.2283 },
  { x: 0.2915, y: 0.2711 },
  { x: 0.2965, y: 0.2961 },
  { x: 0.3204, y: 0.3587 },
  { x: 0.3151, y: 0.4142 },
  { x: 0.3628, y: 0.4829 },
  { x: 0.3976, y: 0.5199 },
  { x: 0.4013, y: 0.5528 },
  { x: 0.4, y: 0.5893 },
  { x: 0.4007, y: 0.6104 },
  { x: 0.3949, y: 0.6622 },
  { x: 0.3947, y: 0.6936 },
  { x: 0.3966, y: 0.716 },
  { x: 0.3967, y: 0.7412 },
  { x: 0.39, y: 0.7691 },
  { x: 0.3693, y: 0.7852 },
  { x: 0.3558, y: 0.8269 },
  { x: 0.329, y: 0.8701 },
  { x: 0.2747, y: 0.906 },
  { x: 0.2491, y: 0.9194 },
  { x: 0.2518, y: 0.8478 },
  { x: 0.2283, y: 0.8401 },
  { x: 0.1752, y: 0.8379 },
  { x: 0.1405, y: 0.8439 },
  { x: 0.0938, y: 0.8299 },
  { x: 0.0862, y: 0.8058 },
  { x: 0.1175, y: 0.8004 },
  { x: 0.1782, y: 0.7981 },
  { x: 0.2379, y: 0.8098 },
  { x: 0.2565, y: 0.7856 },
  { x: 0.2927, y: 0.7822 },
  { x: 0.3381, y: 0.7878 },
  { x: 0.3865, y: 0.7796 },
  { x: 0.3809, y: 0.7214 },
  { x: 0.3928, y: 0.6939 },
  { x: 0.4386, y: 0.6479 },
  { x: 0.472, y: 0.6181 },
  { x: 0.4933, y: 0.5619 },
  { x: 0.5156, y: 0.5103 },
  { x: 0.5343, y: 0.4484 },
  { x: 0.5612, y: 0.3857 },
  { x: 0.5751, y: 0.3279 },
  { x: 0.5719, y: 0.2837 },
  { x: 0.5722, y: 0.2128 },
  { x: 0.5397, y: 0.1548 },
  { x: 0.5255, y: 0.1218 },
  { x: 0.5147, y: 0.1238 },
  { x: 0.4997, y: 0.1227 },
  { x: 0.4818, y: 0.1326 },
  { x: 0.4928, y: 0.1245 },
  { x: 0.5058, y: 0.1219 },
  { x: 0.5229, y: 0.1143 },
  { x: 0.5086, y: 0.1276 },
];

const rideJoburgElevation = [
  { distanceKm: 0, elevationM: 1680 },
  { distanceKm: 15.0, elevationM: 1720 }, // Johannesburg CBD
  { distanceKm: 33.0, elevationM: 1540 }, // Buccleuch valley
  { distanceKm: 49.0, elevationM: 1510 }, // Kyalami Grand Prix Circuit
  { distanceKm: 67.0, elevationM: 1470 }, // Steyn City descent
  { distanceKm: 80.0, elevationM: 1590 }, // Witkoppen climb
  { distanceKm: 90.0, elevationM: 1750 }, // Jan Smuts / Braamfontein ridge
  { distanceKm: 97.0, elevationM: 1680 }, // FNB Stadium finish
];

export const RIDE_JOBURG_EVENT: EventPreset = {
  slug: 'ride-joburg',
  name: 'Virgin Active Ride Joburg',
  shortName: 'Ride Joburg',
  discipline: 'cycling',
  disciplineLabel: 'Road Cycling (Gran Fondo)',
  date: 'November 15, 2026',
  location: 'FNB Stadium, Johannesburg, South Africa',
  distanceKm: 97.0,
  elevationGainM: 1398,
  tagline: "The World's Second-Largest Timed Cycling Race Through Johannesburg",
  heroHeadline: 'Turn Your Ride Joburg Finish Photo Into 3D Route Art',
  description:
    'Celebrate completing the legendary 97 km full-closure circuit across the M1 highway, Kyalami Grand Prix Circuit, Steyn City, and the iconic Nelson Mandela Bridge. Overlay your true GPS route with 3D laser projection and a glass finish plaque.',
  courseHighlights: [
    'Complete road closure through the heart of Johannesburg',
    'High-speed lap around the Kyalami Grand Prix Circuit tarmac',
    'Rolling climbs through Steyn City and Witkoppen',
    'Iconic sprint across the Nelson Mandela Bridge into FNB Stadium',
  ],
  samplePhotoUrl: ASSETS.rideJoburgCyclist,
  sampleActivity: {
    id: 'ride-joburg-2026',
    name: 'Virgin Active Ride Joburg',
    location: 'Johannesburg, South Africa',
    date: 'November 15, 2026',
    sport: 'cycling',
    distanceKm: 97.0,
    durationFormatted: '2:53:14',
    avgPaceOrSpeed: '33.6 km/h',
    elevationGainM: 1398,
    athleteName: 'Athlete',
    bibNumber: '7024',
    customQuote: 'Conquered the City of Gold from Kyalami to the Mandela Bridge.',
    coordinates: rideJoburgCoords,
    elevationProfile: rideJoburgElevation,
  },
  spatialPreset: {
    tiltAngle: 0,
    yawAngle: 0,
    scale: 1.0,
    posX: 0.68,
    posY: 0.52,
    perspectiveDepth: 0.65,
    glowColor: '#FC5200', // Iconic Race Orange
    glowIntensity: 0.90,
    glowEnabled: true,
    lineWidth: 3.0,
    renderMode: 'volumetric_tube',
    shadowEnabled: true,
    shadowIntensity: 0.65,
    shadowOffsetY: 4,
    elevation3dScale: 0.35,
    depthTapering: true,
    tubeSpecular: true,
  },
  hudPreset: {
    enabled: true,
    style: 'smoked_glass',
    orientation: 'straight',
    posX: 0.16,
    posY: 0.76,
    scale: 1.0,
    tiltY: 0,
    tiltX: 0,
    showHeader: true,
    headerTitle: 'VIRGIN ACTIVE RIDE JOBURG',
    headerYear: '2026',
    showStravaLogo: true,
    opacity: 0.94,
    glassThickness: 3,
    glassmorphismIntensity: 75,
    customMetrics: [
      { id: 'm1', label: 'Distance:', value: '97.0 km' },
      { id: 'm2', label: 'Time:', value: '2:53:14' },
      { id: 'm3', label: 'Elevation Gain:', value: '1,398 m' },
      { id: 'm4', label: 'Ave Speed:', value: '33.6 km/h' },
    ],
  },
  elevationPreset: {
    enabled: true,
    posY: 0.92,
    height: 52,
    style: 'glass_ribbon',
    opacity: 0.85,
    showLabels: true,
    widthPercent: 0.90,
  },
  atmospherePreset: {
    grade: 'original',
    brightness: 1.0,
    contrast: 1.05,
    warmth: 5,
  },
  faqs: [
    {
      q: 'How do I get my Ride Joburg GPX track?',
      a: 'Export your recorded ride directly from Garmin Connect (gear icon > Export to GPX) or Strava (three dots > Export GPX). You can also use the official Ride Joburg course route file.',
    },
    {
      q: 'Can I customize my chip time and bib number?',
      a: 'Yes! Inside the Studio, click "Edit Plaque Telemetry" to type your exact finish time, average speed, bib number, and rider name.',
    },
    {
      q: 'What resolution is the finished image for Ride Joburg?',
      a: 'The free version exports at full high resolution with the gpx.photos badge. The $10 Clean Master delivers an unbranded 3840px (300 DPI) file ready to print as a framed cycling memento.',
    },
  ],
};

// Sydney Marathon Event Preset
const sydneyCoords = [
  { x: 0.28, y: 0.16 },
  { x: 0.32, y: 0.22 },
  { x: 0.35, y: 0.28 },
  { x: 0.36, y: 0.36 },
  { x: 0.38, y: 0.44 },
  { x: 0.34, y: 0.50 },
  { x: 0.26, y: 0.54 },
  { x: 0.20, y: 0.62 },
  { x: 0.24, y: 0.70 },
  { x: 0.34, y: 0.76 },
  { x: 0.46, y: 0.82 },
  { x: 0.58, y: 0.86 },
  { x: 0.70, y: 0.84 },
  { x: 0.82, y: 0.78 },
  { x: 0.86, y: 0.68 },
  { x: 0.80, y: 0.58 },
  { x: 0.68, y: 0.50 },
  { x: 0.58, y: 0.44 },
  { x: 0.52, y: 0.38 },
  { x: 0.56, y: 0.32 },
  { x: 0.48, y: 0.24 },
  { x: 0.44, y: 0.18 },
];

const sydneyElevation = [
  { distanceKm: 0, elevationM: 58 },
  { distanceKm: 3.5, elevationM: 64 },
  { distanceKm: 8.2, elevationM: 8 },
  { distanceKm: 14.0, elevationM: 26 },
  { distanceKm: 21.1, elevationM: 42 },
  { distanceKm: 28.5, elevationM: 48 },
  { distanceKm: 35.0, elevationM: 32 },
  { distanceKm: 40.0, elevationM: 18 },
  { distanceKm: 42.2, elevationM: 6 },
];

export const SYDNEY_MARATHON_EVENT: EventPreset = {
  slug: 'sydney-marathon',
  name: 'TCS Sydney Marathon',
  shortName: 'Sydney Marathon',
  discipline: 'running',
  disciplineLabel: 'Road Marathon (World Major Candidate)',
  date: 'September 20, 2026',
  location: 'Sydney Harbour & Opera House, Australia',
  distanceKm: 42.2,
  elevationGainM: 318,
  tagline: 'Australia’s Most Iconic Marathon Across Sydney Harbour Bridge',
  heroHeadline: 'Turn Your Sydney Marathon Finish Photo Into 3D Route Art',
  description:
    'Capture your crossing of the Sydney Harbour Bridge into the world-famous Sydney Opera House Forecourt finish line with true 3D route projection and smoked glass finish plaques.',
  courseHighlights: [
    'Crossing the wide deck of the Sydney Harbour Bridge',
    'Scenic waterfront stretch through Barangaroo and Pyrmont',
    'Centennial Park Grand Drive loop',
    'Spectacular finish on the Sydney Opera House Forecourt',
  ],
  samplePhotoUrl: ASSETS.sydneyMarathon,
  sampleActivity: {
    id: 'sydney-marathon-2026',
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
    coordinates: sydneyCoords,
    elevationProfile: sydneyElevation,
  },
  spatialPreset: {
    tiltAngle: 0,
    yawAngle: 0,
    scale: 1.0,
    posX: 0.72,
    posY: 0.52,
    perspectiveDepth: 0.65,
    glowColor: '#FC5200',
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
  },
  hudPreset: {
    enabled: true,
    style: 'smoked_glass',
    orientation: 'straight',
    posX: 0.16,
    posY: 0.76,
    scale: 1.0,
    tiltY: 0,
    tiltX: 0,
    showHeader: true,
    headerTitle: 'SYDNEY MARATHON',
    headerYear: '2026',
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
  },
  faqs: [
    {
      q: 'How do I load my Sydney Marathon finish photo?',
      a: 'Click "Customize in Studio" and drop your race photo taken on the Harbour Bridge or Opera House. The Sydney Marathon route will auto-align.',
    },
    {
      q: 'Can I enter my exact Sydney Marathon wave chip time?',
      a: 'Yes, in the Studio you can adjust hours, minutes, seconds, and bib number on the plaque.',
    },
  ],
};

export const FEATURED_EVENTS: EventPreset[] = [
  RIDE_JOBURG_EVENT,
  SYDNEY_MARATHON_EVENT,
];
