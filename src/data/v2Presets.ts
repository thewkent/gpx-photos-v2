import {
  ElevationOverlayConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  SpatialRouteConfig,
  SportType,
} from '../types/poster';
import { ASSETS } from './sampleRoutes';

export type V2PresetId = 'signature_3d' | 'editorial' | 'map_elevation';

export interface V2VisualPreset {
  id: V2PresetId;
  name: string;
  tagline: string;
  badge?: string;
  description: string;
  spatialRoute: Partial<SpatialRouteConfig>;
  hudCard: Partial<HudCardConfig>;
  elevationConfig: Partial<ElevationOverlayConfig>;
  atmosphere: Partial<PhotoAtmosphereConfig>;
}

export const V2_VISUAL_PRESETS: V2VisualPreset[] = [
  {
    id: 'signature_3d',
    name: 'Signature 3D',
    tagline: 'Sculpted route ribbon & futuristic telemetry',
    badge: 'Flagship Look',
    description:
      'A dimensional orange route ribbon with metallic bevels, contact shadow, start/finish beacons and a compact futuristic instrument readout.',
    spatialRoute: {
      tiltAngle: 34,
      yawAngle: 0,
      scale: 1.08,
      posX: 0.66,
      posY: 0.52,
      perspectiveDepth: 0.68,
      glowColor: '#FC5200',
      glowIntensity: 0.72,
      glowEnabled: true,
      lineWidth: 4.2,
      renderMode: 'molten_laser',
      shadowEnabled: true,
      shadowIntensity: 0.75,
      shadowOffsetY: 6,
      elevation3dScale: 0.62,
      depthTapering: true,
      tubeSpecular: true,
    },
    hudCard: {
      enabled: true,
      style: 'neon_rim',
      orientation: 'straight',
      tiltX: 0,
      tiltY: 0,
      posX: 0.06,
      posY: 0.68,
      scale: 0.94,
      opacity: 0.94,
      glassThickness: 3,
      glassmorphismIntensity: 78,
      showHeader: true,
      showStravaLogo: true,
    },
    elevationConfig: {
      enabled: false,
      posY: 0.84,
      height: 34,
      style: 'glass_ribbon',
      opacity: 0.68,
      showLabels: true,
      widthPercent: 0.9,
    },
    atmosphere: {
      grade: 'original',
      brightness: 1.0,
      contrast: 1.04,
      warmth: 0,
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Restrained vector line & clean gallery card',
    description:
      'Understated overhead route with a crisp frosted panel and zero distractions so the photograph leads.',
    spatialRoute: {
      tiltAngle: 0,
      yawAngle: 0,
      scale: 0.86,
      posX: 0.74,
      posY: 0.34,
      perspectiveDepth: 0.4,
      glowColor: '#F8FAFC',
      glowIntensity: 0.25,
      glowEnabled: false,
      lineWidth: 2.2,
      renderMode: 'minimal_vector',
      shadowEnabled: false,
      shadowIntensity: 0.25,
      shadowOffsetY: 2,
      elevation3dScale: 0,
      depthTapering: false,
      tubeSpecular: false,
    },
    hudCard: {
      enabled: true,
      style: 'frosted_ice',
      orientation: 'straight',
      tiltX: 0,
      tiltY: 0,
      posX: 0.06,
      posY: 0.68,
      scale: 0.95,
      opacity: 0.92,
      glassThickness: 1,
      glassmorphismIntensity: 62,
      showHeader: true,
      showStravaLogo: true,
    },
    elevationConfig: {
      enabled: false,
      posY: 0.93,
      height: 44,
      style: 'minimal_line',
      opacity: 0.75,
      showLabels: true,
      widthPercent: 0.88,
    },
    atmosphere: {
      grade: 'high_contrast',
      brightness: 1.0,
      contrast: 1.04,
      warmth: 0,
    },
  },
  {
    id: 'map_elevation',
    name: 'Map & Elevation',
    tagline: 'Compact route badge & full elevation profile',
    description:
      'Pairs a neat overhead course trace with an emphasized elevation ribbon and dark telemetry plaque.',
    spatialRoute: {
      tiltAngle: 0,
      yawAngle: 0,
      scale: 0.76,
      posX: 0.76,
      posY: 0.28,
      perspectiveDepth: 0.5,
      glowColor: '#FC5200',
      glowIntensity: 0.72,
      glowEnabled: true,
      lineWidth: 2.8,
      renderMode: 'volumetric_tube',
      shadowEnabled: true,
      shadowIntensity: 0.6,
      shadowOffsetY: 4,
      elevation3dScale: 0.2,
      depthTapering: false,
      tubeSpecular: true,
    },
    hudCard: {
      enabled: true,
      style: 'carbon_fiber',
      orientation: 'straight',
      tiltX: 0,
      tiltY: 0,
      posX: 0.06,
      posY: 0.1,
      scale: 0.96,
      opacity: 0.95,
      glassThickness: 3,
      glassmorphismIntensity: 85,
      showHeader: true,
      showStravaLogo: true,
    },
    elevationConfig: {
      enabled: true,
      posY: 0.93,
      height: 74,
      style: 'glass_ribbon',
      opacity: 0.92,
      showLabels: true,
      widthPercent: 0.92,
    },
    atmosphere: {
      grade: 'original',
      brightness: 1.0,
      contrast: 1.02,
      warmth: 0,
    },
  },
];

export interface OutdoorActivityOption {
  id: string;
  label: string;
  sportType: SportType;
  rateLabel: string;
}

export const OUTDOOR_ACTIVITY_OPTIONS: OutdoorActivityOption[] = [
  { id: 'running', label: 'Running', sportType: 'running', rateLabel: 'Ave Pace:' },
  { id: 'trail_running', label: 'Trail Running', sportType: 'trail', rateLabel: 'Ave Pace:' },
  { id: 'cycling', label: 'Cycling', sportType: 'cycling', rateLabel: 'Ave Speed:' },
  { id: 'gravel', label: 'Gravel', sportType: 'cycling', rateLabel: 'Ave Speed:' },
  { id: 'mtb', label: 'Mountain Biking', sportType: 'cycling', rateLabel: 'Ave Speed:' },
  { id: 'hiking', label: 'Hiking', sportType: 'hiking', rateLabel: 'Peak Altitude:' },
  { id: 'walking', label: 'Walking', sportType: 'hiking', rateLabel: 'Ave Pace:' },
];

export interface SamplePhotoPreset {
  id: string;
  label: string;
  category: string;
  url: string;
}

export const V2_SAMPLE_PHOTOS: SamplePhotoPreset[] = [
  {
    id: 'sydney',
    label: 'City Marathon',
    category: 'Running',
    url: ASSETS.sydneyMarathon,
  },
  {
    id: 'ride_joburg',
    label: 'Peloton Climb',
    category: 'Cycling',
    url: ASSETS.rideJoburgCyclist,
  },
  {
    id: 'trail_summit',
    label: 'Alpine Ridge',
    category: 'Trail & Hiking',
    url: ASSETS.trailSummit,
  },
  {
    id: 'road_tarmac',
    label: 'Open Tarmac',
    category: 'Road Run',
    url: ASSETS.roadMarathoner,
  },
];
