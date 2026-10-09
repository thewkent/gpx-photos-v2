import React, { useRef, useState } from 'react';
import { SAMPLE_ACTIVITIES } from '../data/sampleRoutes';
import { StravaActivityData, SpatialRouteConfig, HudCardConfig, ElevationOverlayConfig } from '../types/poster';
import { parseGpxString } from '../utils/gpxParser';
import {
  Upload,
  Check,
  Compass,
  Layout,
  Sliders,
  Move,
  RotateCw,
  Sparkles,
  Edit3,
  Layers,
  ArrowRightLeft,
  TrendingUp,
  Pipette,
  Box,
  Mountain,
  Sun,
} from 'lucide-react';

interface OverlayTabProps {
  activity: StravaActivityData;
  onUpdateActivity: (updated: Partial<StravaActivityData>) => void;
  spatialRoute: SpatialRouteConfig;
  onUpdateSpatialRoute: (updated: Partial<SpatialRouteConfig>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  elevationConfig: ElevationOverlayConfig;
  onUpdateElevationConfig: (updated: Partial<ElevationOverlayConfig>) => void;
}

export const OverlayTab: React.FC<OverlayTabProps> = ({
  activity,
  onUpdateActivity,
  spatialRoute,
  onUpdateSpatialRoute,
  hudCard,
  onUpdateHudCard,
  elevationConfig,
  onUpdateElevationConfig,
}) => {
  const [subSection, setSubSection] = useState<'route' | 'hud' | 'elevation'>('route');
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isUploadingGpx, setIsUploadingGpx] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const glowColors = [
    { label: 'Orange', hex: '#FC5200' },
    { label: 'Race Crimson', hex: '#E11D48' },
    { label: 'Ocean Cyan', hex: '#0284C7' },
    { label: 'Black', hex: '#000000' },
    { label: 'Alpine Emerald', hex: '#059669' },
    { label: 'Laser White', hex: '#F8FAFC' },
  ];

  const glassStyles = [
    { id: 'smoked_glass', label: 'Smoked Glass (Subtle Tint)' },
    { id: 'frosted_ice', label: 'Frosted Ice' },
    { id: 'carbon_fiber', label: 'Carbon Fiber' },
    { id: 'neon_rim', label: 'Neon Rim Glow' },
  ] as const;

  // Accurate Imperial / Metric detection that reliably toggles back and forth
  const isCurrentlyImperial =
    hudCard.customMetrics?.some((m) => m.value.includes('mi') || m.value.includes('ft') || m.value.includes('mph')) ||
    activity.avgPaceOrSpeed.includes('mph') ||
    activity.avgPaceOrSpeed.includes('/mi');

  const toggleUnitSystem = () => {
    if (!isCurrentlyImperial) {
      // Switch TO Imperial
      const mi = (activity.distanceKm * 0.621371).toFixed(2);
      const ft = Math.round(activity.elevationGainM * 3.28084).toLocaleString();
      const rawSpeed = parseFloat(activity.avgPaceOrSpeed) || 34.7;
      const speedMph = (rawSpeed * 0.621371).toFixed(1);

      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${mi} mi` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Elevation Gain:', value: `${ft} ft` },
          {
            id: 'm4',
            label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
            value: activity.sport === 'cycling' ? `${speedMph} mph` : '6:38 /mi',
          },
        ],
      });
      onUpdateActivity({
        avgPaceOrSpeed: activity.sport === 'cycling' ? `${speedMph} mph` : '6:38 /mi',
      });
    } else {
      // Switch BACK TO Metric
      const rawSpeed = parseFloat(activity.avgPaceOrSpeed) || 21.5;
      const kmh = (rawSpeed / 0.621371).toFixed(1);

      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Elevation Gain:', value: `${activity.elevationGainM.toLocaleString()} m` },
          {
            id: 'm4',
            label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
            value: activity.sport === 'cycling' ? `${kmh} km/h` : '3:48 /km',
          },
        ],
      });
      onUpdateActivity({
        avgPaceOrSpeed: activity.sport === 'cycling' ? `${kmh} km/h` : '3:48 /km',
      });
    }
  };

  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGpx(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGpxString(text, activity.athleteName);

        const newDistance = parsed.distanceKm || activity.distanceKm;
        const newTime = parsed.durationFormatted || activity.durationFormatted;
        const newElevation = parsed.elevationGainM || activity.elevationGainM;
        const newSpeed = parsed.avgPaceOrSpeed || activity.avgPaceOrSpeed;

        onUpdateActivity({
          id: `custom-${Date.now()}`,
          name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
          distanceKm: newDistance,
          durationFormatted: newTime,
          avgPaceOrSpeed: newSpeed,
          elevationGainM: newElevation,
          coordinates: parsed.coordinates && parsed.coordinates.length > 0 ? parsed.coordinates : activity.coordinates,
          elevationProfile: parsed.elevationProfile && parsed.elevationProfile.length > 0 ? parsed.elevationProfile : activity.elevationProfile,
        });

        // Sync HUD Card metrics
        onUpdateHudCard({
          customMetrics: [
            { id: 'm1', label: 'Distance:', value: `${newDistance} km` },
            { id: 'm2', label: 'Time:', value: newTime },
            { id: 'm3', label: 'Elevation Gain:', value: `${newElevation.toLocaleString()} m` },
            { id: 'm4', label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:', value: newSpeed },
          ],
        });

        setIsUploadingGpx(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse GPX file';
        setUploadError(msg);
        setIsUploadingGpx(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* 3-Section Sub-Navigation for Overlay Tab */}
      <div className="grid grid-cols-3 p-1 bg-zinc-900 border border-white/10 rounded-lg">
        <button
          onClick={() => setSubSection('route')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all ${
            subSection === 'route'
              ? 'bg-zinc-800 text-amber-400 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>GPS Route</span>
        </button>

        <button
          onClick={() => setSubSection('hud')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all ${
            subSection === 'hud'
              ? 'bg-zinc-800 text-amber-400 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>HUD Plaque</span>
        </button>

        <button
          onClick={() => setSubSection('elevation')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all ${
            subSection === 'elevation'
              ? 'bg-zinc-800 text-amber-400 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Elevation</span>
        </button>
      </div>

      {/* Global HUD Glassmorphism & Translucency Quick Control */}
      <div className="p-3 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-white">HUD Glassmorphism Intensity</span>
          </div>
          <span className="text-[10px] text-zinc-400 block">
            Adjust blur & translucency of the telemetry plaque
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={hudCard.glassmorphismIntensity ?? 75}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateHudCard({ glassmorphismIntensity: val });
            }}
            className="w-20 sm:w-28 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs text-amber-400 font-bold min-w-[32px] text-right">
            {hudCard.glassmorphismIntensity ?? 75}%
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: GPS ROUTE OVERLAY                             */}
      {/* ======================================================== */}
      {subSection === 'route' && (
        <div className="space-y-5">
          {/* GPX Upload & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Route Source & GPX
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Loop Auto-Closed</span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx"
              onChange={handleGpxUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingGpx}
              className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl text-xs font-medium text-zinc-300 transition-all cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{isUploadingGpx ? 'Parsing Track Points...' : 'Upload Custom GPX File'}</span>
            </button>

            {uploadError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg">
                {uploadError}
              </p>
            )}
          </div>

          {/* Color Palette & Custom Color Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Route & Elevation Color
              </span>
              <span className="text-[11px] font-mono text-zinc-400 uppercase">
                {spatialRoute.glowColor}
              </span>
            </div>

            {/* Preset Color Swatches */}
            <div className="grid grid-cols-6 gap-2">
              {glowColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => onUpdateSpatialRoute({ glowColor: c.hex })}
                  className={`h-8 rounded-lg border-2 transition-all cursor-pointer ${
                    spatialRoute.glowColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-white scale-105 shadow-md shadow-amber-400/20 ring-1 ring-white/50'
                      : 'border-white/10 opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>

            {/* Custom Color Wheel / Native Color Picker */}
            <div className="flex items-center gap-2 mt-2.5 p-2 bg-zinc-900/60 border border-white/10 rounded-lg">
              <div className="relative w-7 h-7 rounded-md overflow-hidden border border-white/20 shrink-0 cursor-pointer shadow-inner">
                <input
                  type="color"
                  value={spatialRoute.glowColor.length === 7 ? spatialRoute.glowColor : '#FC5200'}
                  onChange={(e) => onUpdateSpatialRoute({ glowColor: e.target.value })}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                  title="Click to open Color Wheel / Color Picker"
                />
              </div>

              <div className="flex-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Pipette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Custom Color</span>
                </div>
                <input
                  type="text"
                  value={spatialRoute.glowColor}
                  onChange={(e) => onUpdateSpatialRoute({ glowColor: e.target.value })}
                  placeholder="#FC5200"
                  maxLength={7}
                  className="w-20 px-2 py-0.5 bg-zinc-950 border border-white/10 rounded font-mono text-xs text-white uppercase text-center"
                />
              </div>
            </div>
          </div>

          {/* Ground Tilt & Perspective */}
          <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3.5">
            {/* Tilt Angle (Pitch) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Ground Tilt Angle (Pitch)</span>
                <span className="font-mono text-amber-400">
                  {spatialRoute.tiltAngle === 0 ? '0° (Flat 2D Overhead)' : `${spatialRoute.tiltAngle}°`}
                </span>
              </div>

              {/* Quick Angle Presets */}
              <div className="grid grid-cols-4 gap-1 mb-2">
                {[
                  { label: '0° Flat', angle: 0 },
                  { label: '10° Subtle', angle: 10 },
                  { label: '25° Road', angle: 25 },
                  { label: '35° Dynamic', angle: 35 },
                ].map((p) => (
                  <button
                    key={p.angle}
                    onClick={() => onUpdateSpatialRoute({ tiltAngle: p.angle })}
                    className={`py-1 px-1.5 text-[10px] rounded font-medium transition-all ${
                      spatialRoute.tiltAngle === p.angle
                        ? 'bg-amber-400 text-zinc-950 font-semibold'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0"
                max="85"
                step="0.5"
                value={spatialRoute.tiltAngle}
                onChange={(e) => onUpdateSpatialRoute({ tiltAngle: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>0° (Flat Overhead)</span>
                <span>85° (Steep Road Surface)</span>
              </div>
            </div>

            {/* Yaw Trajectory Rotation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300">Road Trajectory Angle (Yaw)</span>
                <span className="font-mono text-amber-400">{spatialRoute.yawAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="2"
                value={spatialRoute.yawAngle}
                onChange={(e) => onUpdateSpatialRoute({ yawAngle: parseInt(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Scale & Road Placement */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Route Scale</span>
                  <span className="font-mono text-white">{Math.round(spatialRoute.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={spatialRoute.scale}
                  onChange={(e) => onUpdateSpatialRoute({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Line Thickness</span>
                  <span className="font-mono text-amber-400 font-semibold">{spatialRoute.lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={spatialRoute.lineWidth}
                  onChange={(e) => onUpdateSpatialRoute({ lineWidth: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3D Visualization Render Style */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    3D Route Style
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {spatialRoute.renderMode === 'laser_ribbon'
                    ? 'Laser Ribbon'
                    : spatialRoute.renderMode === 'archival_shadow'
                    ? 'Archival Shadow'
                    : spatialRoute.renderMode === 'minimal_vector'
                    ? 'Minimal Vector'
                    : 'Volumetric Tube'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'volumetric_tube', label: 'Volumetric Tube', desc: 'Beveled tube & specular ridge' },
                  { id: 'laser_ribbon', label: 'Neon Laser', desc: 'Emissive radiant glow' },
                  { id: 'archival_shadow', label: 'Archival Shadow', desc: 'Deep ground shadow' },
                  { id: 'minimal_vector', label: 'Minimal Vector', desc: 'Crisp flat vector' },
                ].map((mode) => {
                  const isSelected = (spatialRoute.renderMode || 'volumetric_tube') === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() =>
                        onUpdateSpatialRoute({
                          renderMode: mode.id as SpatialRouteConfig['renderMode'],
                        })
                      }
                      className={`p-2 rounded-lg text-left border transition-all ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-xs'
                          : 'bg-zinc-950/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      <div className="text-xs font-medium leading-tight text-white">{mode.label}</div>
                      <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ground Contact Drop Shadow */}
            <div className="pt-2 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-300">Ground Contact Shadow</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSpatialRoute({
                      shadowEnabled: spatialRoute.shadowEnabled === false ? true : false,
                    })
                  }
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md font-medium border transition-all cursor-pointer ${
                    spatialRoute.shadowEnabled !== false
                      ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300'
                      : 'bg-zinc-850 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {spatialRoute.shadowEnabled !== false ? 'Shadow ON' : 'Shadow OFF'}
                </button>
              </div>

              {spatialRoute.shadowEnabled !== false && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Shadow Depth</span>
                      <span className="font-mono text-amber-400">
                        {Math.round((spatialRoute.shadowIntensity ?? 0.65) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={spatialRoute.shadowIntensity ?? 0.65}
                      onChange={(e) =>
                        onUpdateSpatialRoute({ shadowIntensity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Ground Offset</span>
                      <span className="font-mono text-white">{spatialRoute.shadowOffsetY ?? 4}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={spatialRoute.shadowOffsetY ?? 4}
                      onChange={(e) =>
                        onUpdateSpatialRoute({ shadowOffsetY: parseInt(e.target.value) })
                      }
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3D Elevation Relief (Z-Lift Extrusion) */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-300">3D Elevation Relief (Z-Lift)</span>
                </div>
                <span className="font-mono text-[11px] text-amber-400">
                  {Math.round((spatialRoute.elevation3dScale ?? 0.35) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={spatialRoute.elevation3dScale ?? 0.35}
                onChange={(e) =>
                  onUpdateSpatialRoute({ elevation3dScale: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0% (Flat to Ground)</span>
                <span>150% (High Alpine Peaks)</span>
              </div>
            </div>

            {/* Perspective Depth Tapering & Aerial Haze */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-300 block">Perspective Depth Tapering</span>
                <span className="text-[10px] text-zinc-500 block">Thins distant segments & adds atmospheric depth</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSpatialRoute({
                    depthTapering: spatialRoute.depthTapering === false ? true : false,
                  })
                }
                className={`px-2.5 py-1 text-[11px] font-mono rounded-md font-medium border transition-all cursor-pointer ${
                  spatialRoute.depthTapering !== false
                    ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300'
                    : 'bg-zinc-850 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                {spatialRoute.depthTapering !== false ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Laser & Neon Glow Control */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-300">Route & Elevation Glow</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSpatialRoute({ glowEnabled: spatialRoute.glowEnabled === false ? true : false })}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md font-medium border transition-all cursor-pointer ${
                    spatialRoute.glowEnabled !== false
                      ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300'
                      : 'bg-zinc-850 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {spatialRoute.glowEnabled !== false ? 'Glow ON' : 'Glow OFF (Matte)'}
                </button>
              </div>

              {spatialRoute.glowEnabled !== false && (
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Glow Radiance</span>
                    <span className="font-mono text-amber-400">{Math.round((spatialRoute.glowIntensity ?? 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={spatialRoute.glowIntensity ?? 0.85}
                    onChange={(e) => onUpdateSpatialRoute({ glowIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Position X and Y (Middle Right default) */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Horizontal (X)</span>
                  <span className="font-mono text-white">{Math.round(spatialRoute.posX * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.02"
                  value={spatialRoute.posX}
                  onChange={(e) => onUpdateSpatialRoute({ posX: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Vertical (Y)</span>
                  <span className="font-mono text-white">{Math.round(spatialRoute.posY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.02"
                  value={spatialRoute.posY}
                  onChange={(e) => onUpdateSpatialRoute({ posY: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: GLASS HUD TELEMETRY PLAQUE                    */}
      {/* ======================================================== */}
      {subSection === 'hud' && (
        <div className="space-y-5">
          {/* Header & Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Glass HUD Telemetry Plaque
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] text-zinc-400">Plaque Enabled</span>
              <input
                type="checkbox"
                checked={hudCard.enabled}
                onChange={(e) => onUpdateHudCard({ enabled: e.target.checked })}
                className="accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {hudCard.enabled && (
            <div className="space-y-4">
              {/* Orientation: Flat / Straight vs 3D Slanted */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1.5">Plaque Orientation</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      onUpdateHudCard({
                        orientation: 'straight',
                        tiltY: 0,
                        tiltX: 0,
                      })
                    }
                    className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      hudCard.tiltY === 0 && hudCard.tiltX === 0
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-xs'
                        : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white'
                    }`}
                  >
                    Flat / Straight (Default)
                  </button>

                  <button
                    onClick={() =>
                      onUpdateHudCard({
                        orientation: 'slanted_left',
                        tiltY: 16,
                        tiltX: 20,
                      })
                    }
                    className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      hudCard.orientation === 'slanted_left' && hudCard.tiltY !== 0
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-xs'
                        : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white'
                    }`}
                  >
                    3D Road Slant
                  </button>
                </div>
              </div>

              {/* Event Name & Year Header Customizer */}
              <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="font-semibold text-zinc-300">Event Brand Header</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[11px] text-zinc-400">Show Header</span>
                    <input
                      type="checkbox"
                      checked={hudCard.showHeader !== false && hudCard.showStravaLogo !== false}
                      onChange={(e) => onUpdateHudCard({ showHeader: e.target.checked, showStravaLogo: e.target.checked })}
                      className="accent-amber-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {(hudCard.showHeader !== false && hudCard.showStravaLogo !== false) && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Event / Race Title
                      </label>
                      <input
                        type="text"
                        value={hudCard.headerTitle ?? activity.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateHudCard({ headerTitle: val });
                          onUpdateActivity({ name: val });
                        }}
                        placeholder="e.g. CAPE EPIC"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={hudCard.headerYear ?? '2026'}
                        onChange={(e) => onUpdateHudCard({ headerYear: e.target.value })}
                        placeholder="2026"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Glass Styles */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1.5">Glass Material & Finish</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {glassStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdateHudCard({ style: style.id })}
                      className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                        hudCard.style === style.id
                          ? 'bg-zinc-800 border-amber-400 text-white'
                          : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glassmorphism Intensity & Translucency Slider */}
              <div className="p-3.5 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-white/[0.08] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-white">HUD Glassmorphism Intensity</span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {hudCard.glassmorphismIntensity ?? 75}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={hudCard.glassmorphismIntensity ?? 75}
                    onChange={(e) => onUpdateHudCard({ glassmorphismIntensity: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>0% (Crystal Clear)</span>
                    <span className="text-zinc-500">
                      {(hudCard.glassmorphismIntensity ?? 75) < 35
                        ? 'Crystal Translucent'
                        : (hudCard.glassmorphismIntensity ?? 75) < 70
                        ? 'Balanced Frosted Glass'
                        : 'Deep Frosted Acrylic'}
                    </span>
                    <span>100% (Deep Frost)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => onUpdateHudCard({ glassmorphismIntensity: 25 })}
                    className={`py-1 px-2 text-[10px] font-mono rounded text-center border transition-all cursor-pointer ${
                      (hudCard.glassmorphismIntensity ?? 75) <= 30
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Clear (25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateHudCard({ glassmorphismIntensity: 60 })}
                    className={`py-1 px-2 text-[10px] font-mono rounded text-center border transition-all cursor-pointer ${
                      (hudCard.glassmorphismIntensity ?? 75) > 30 && (hudCard.glassmorphismIntensity ?? 75) <= 70
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Balanced (60%)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateHudCard({ glassmorphismIntensity: 90 })}
                    className={`py-1 px-2 text-[10px] font-mono rounded text-center border transition-all cursor-pointer ${
                      (hudCard.glassmorphismIntensity ?? 75) > 70
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Deep Frost (90%)
                  </button>
                </div>
              </div>

              {/* Plaque Scale & Tilt Controls */}
              <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Plaque Scale</span>
                      <span className="font-mono text-white">{Math.round(hudCard.scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={hudCard.scale}
                      onChange={(e) => onUpdateHudCard({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Glass Thickness</span>
                      <span className="font-mono text-white">{hudCard.glassThickness || 3}mm</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={hudCard.glassThickness || 3}
                      onChange={(e) => onUpdateHudCard({ glassThickness: parseInt(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3D Slant & Pitch */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">3D Horizontal Slant</span>
                      <span className="font-mono text-white">{hudCard.tiltY}°</span>
                    </div>
                    <input
                      type="range"
                      min="-35"
                      max="35"
                      step="1"
                      value={hudCard.tiltY}
                      onChange={(e) =>
                        onUpdateHudCard({
                          tiltY: parseInt(e.target.value),
                          orientation: parseInt(e.target.value) !== 0 ? 'slanted_left' : 'straight',
                        })
                      }
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">3D Ground Pitch</span>
                      <span className="font-mono text-white">{hudCard.tiltX}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={hudCard.tiltX}
                      onChange={(e) => onUpdateHudCard({ tiltX: parseInt(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Plaque Position X and Y (Bottom Left default) */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Horizontal (Left)</span>
                      <span className="font-mono text-white">{Math.round(hudCard.posX * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.85"
                      step="0.02"
                      value={hudCard.posX}
                      onChange={(e) => onUpdateHudCard({ posX: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Vertical (Bottom)</span>
                      <span className="font-mono text-white">{Math.round(hudCard.posY * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.02"
                      value={hudCard.posY}
                      onChange={(e) => onUpdateHudCard({ posY: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Units & Quick Actions (Fixes toggle reliably) */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-lg">
                <span className="text-xs text-zinc-300">
                  Current Units:{' '}
                  <strong className="text-amber-400">{isCurrentlyImperial ? 'Imperial (Miles)' : 'Metric (Kilometers)'}</strong>
                </span>
                <button
                  onClick={toggleUnitSystem}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-750 text-white rounded border border-white/10 transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                  <span>{isCurrentlyImperial ? 'Switch to Metric (km)' : 'Switch to Imperial (mi)'}</span>
                </button>
              </div>

              {/* Plaque Metrics Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Plaque Telemetry Values
                  </span>
                  <button
                    onClick={() => setIsEditingStats(!isEditingStats)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingStats ? 'Done' : 'Edit Text'}</span>
                  </button>
                </div>

                {isEditingStats ? (
                  <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-2.5 text-xs">
                    {(hudCard.customMetrics || []).map((m, idx) => (
                      <div key={m.id || idx} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const updated = [...(hudCard.customMetrics || [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            onUpdateHudCard({ customMetrics: updated });
                          }}
                          className="px-2 py-1 bg-zinc-950 border border-white/10 rounded text-zinc-300 text-xs"
                          placeholder="Metric label"
                        />
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => {
                            const updated = [...(hudCard.customMetrics || [])];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            onUpdateHudCard({ customMetrics: updated });
                          }}
                          className="px-2 py-1 bg-zinc-950 border border-white/10 rounded text-white text-xs font-mono font-medium"
                          placeholder="Value"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl">
                    {(hudCard.customMetrics || []).map((m) => (
                      <div key={m.id} className="flex justify-between items-center bg-zinc-950/60 p-2 rounded border border-white/5">
                        <span className="text-zinc-400 text-[11px] truncate">{m.label}</span>
                        <span className="text-white font-mono text-[11px] font-semibold">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: ELEVATION PROFILE OVERLAY                     */}
      {/* ======================================================== */}
      {subSection === 'elevation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Elevation Profile Ribbon
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] text-zinc-400">Profile Enabled</span>
              <input
                type="checkbox"
                checked={elevationConfig.enabled}
                onChange={(e) => onUpdateElevationConfig({ enabled: e.target.checked })}
                className="accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {elevationConfig.enabled && (
            <div className="space-y-4">
              {/* Vertical Position (Move Up / Down) */}
              <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300 font-medium">Vertical Placement (Move Up / Down)</span>
                    <span className="font-mono text-amber-400">{Math.round(elevationConfig.posY * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.65"
                    max="0.98"
                    step="0.01"
                    value={elevationConfig.posY}
                    onChange={(e) => onUpdateElevationConfig({ posY: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>Higher on Photo (65%)</span>
                    <span>Bottom Edge (98%)</span>
                  </div>

                  {/* Quick Position Presets */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                    {[
                      { label: 'Bottom Ribbon', pos: 0.92 },
                      { label: 'Baseline Flush', pos: 0.96 },
                      { label: 'Mid-Lower', pos: 0.82 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => onUpdateElevationConfig({ posY: p.pos })}
                        className={`py-1 px-1.5 text-[10px] rounded font-medium transition-all ${
                          Math.abs(elevationConfig.posY - p.pos) < 0.02
                            ? 'bg-amber-400 text-zinc-950 font-semibold'
                            : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Height */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Ribbon Height</span>
                      <span className="font-mono text-white">{elevationConfig.height}px</span>
                    </div>
                    <input
                      type="range"
                      min="28"
                      max="90"
                      step="2"
                      value={elevationConfig.height}
                      onChange={(e) => onUpdateElevationConfig({ height: parseInt(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Ribbon Width</span>
                      <span className="font-mono text-white">{Math.round(elevationConfig.widthPercent * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.60"
                      max="0.96"
                      step="0.02"
                      value={elevationConfig.widthPercent}
                      onChange={(e) => onUpdateElevationConfig({ widthPercent: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Ribbon Style & Finish */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1.5">Profile Style</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'glass_ribbon', label: 'Glass Ribbon', desc: 'Gradient fill with glowing ridge' },
                    { id: 'minimal_line', label: 'Minimal Ridge Line', desc: 'Clean vector outline' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        onUpdateElevationConfig({ style: s.id as ElevationOverlayConfig['style'] })
                      }
                      className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                        elevationConfig.style === s.id
                          ? 'bg-zinc-800 border-amber-400 text-white shadow-xs'
                          : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-white">{s.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Labels Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-lg text-xs text-zinc-300">
                <span>Display Elevation Peak & Gain Markers</span>
                <input
                  type="checkbox"
                  checked={elevationConfig.showLabels}
                  onChange={(e) => onUpdateElevationConfig({ showLabels: e.target.checked })}
                  className="accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Linked Map Route Styling & Quick Adjustments */}
              <div className="p-3 bg-zinc-900/60 border border-white/10 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                      style={{ backgroundColor: spatialRoute.glowColor }}
                    />
                    <span className="text-zinc-200 font-medium">Synced Ridge Styling</span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono border border-amber-400/20">
                    Linked to Map
                  </span>
                </div>

                {/* Line Thickness Slider for Elevation & Route */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Ridge & Route Line Thickness</span>
                    <span className="font-mono text-amber-400 font-semibold">{spatialRoute.lineWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.5"
                    value={spatialRoute.lineWidth}
                    onChange={(e) => onUpdateSpatialRoute({ lineWidth: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Glow Toggle for Elevation & Route */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-zinc-300">Neon / Laser Glow</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSpatialRoute({ glowEnabled: spatialRoute.glowEnabled === false ? true : false })}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded font-medium border transition-all cursor-pointer ${
                      spatialRoute.glowEnabled !== false
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300'
                        : 'bg-zinc-850 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {spatialRoute.glowEnabled !== false ? 'Glow ON' : 'Glow OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
