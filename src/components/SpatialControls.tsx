import React from 'react';
import {
  SpatialRouteConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  StravaActivityData,
  HudOrientation,
} from '../types/poster';
import {
  Compass,
  Layers,
  Sun,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

interface SpatialControlsProps {
  activity: StravaActivityData;
  onUpdateActivity: (updated: Partial<StravaActivityData>) => void;
  spatialRoute: SpatialRouteConfig;
  onUpdateSpatialRoute: (updated: Partial<SpatialRouteConfig>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  atmosphere: PhotoAtmosphereConfig;
  onUpdateAtmosphere: (updated: Partial<PhotoAtmosphereConfig>) => void;
}

export const SpatialControls: React.FC<SpatialControlsProps> = ({
  activity,
  onUpdateActivity,
  spatialRoute,
  onUpdateSpatialRoute,
  hudCard,
  onUpdateHudCard,
  atmosphere,
  onUpdateAtmosphere,
}) => {
  const glowColors = [
    { label: 'Race Orange', hex: '#FC5200' },
    { label: 'Race Crimson', hex: '#E11D48' },
    { label: 'Ocean Cyan', hex: '#0284C7' },
    { label: 'Sunset Amber', hex: '#D97706' },
    { label: 'Alpine Emerald', hex: '#059669' },
    { label: 'Laser White', hex: '#F8FAFC' },
  ];

  const glassStyles = [
    { id: 'smoked_glass', label: 'Smoked Glass (Subtle Tint)' },
    { id: 'frosted_ice', label: 'Frosted Ice' },
    { id: 'carbon_fiber', label: 'Carbon Fiber' },
    { id: 'neon_rim', label: 'Neon Rim Glow' },
  ] as const;

  // Handle unit system conversion (Metric <-> Imperial)
  const toggleUnitSystem = () => {
    const isKm = activity.avgPaceOrSpeed.includes('km') || hudCard.customMetrics?.[0]?.value.includes('km');

    if (isKm) {
      // Convert to Imperial
      const mi = (activity.distanceKm * 0.621371).toFixed(2);
      const ft = Math.round(activity.elevationGainM * 3.28084).toLocaleString();
      const speedMph = (parseFloat(activity.avgPaceOrSpeed) * 0.621371).toFixed(1);

      const newMetrics = [
        { id: 'm1', label: 'Distance:', value: `${mi} mi` },
        { id: 'm2', label: 'Time:', value: activity.durationFormatted },
        { id: 'm3', label: 'Elevation Gain:', value: `${ft} ft` },
        {
          id: 'm4',
          label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
          value: activity.sport === 'cycling' ? `${speedMph} mph` : '6:38 /mi',
        },
      ];

      onUpdateHudCard({ customMetrics: newMetrics });
    } else {
      // Convert back to Metric
      const newMetrics = [
        { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
        { id: 'm2', label: 'Time:', value: activity.durationFormatted },
        { id: 'm3', label: 'Elevation Gain:', value: `${activity.elevationGainM.toLocaleString()} m` },
        {
          id: 'm4',
          label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
          value: activity.avgPaceOrSpeed,
        },
      ];

      onUpdateHudCard({ customMetrics: newMetrics });
    }
  };

  // Preset Sport & Adventure Templates for the Plaque
  const applyPlaqueTemplate = (template: 'cycling_std' | 'hiking_trek' | 'running_marathon' | 'trail_ultra') => {
    if (template === 'cycling_std') {
      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Elevation Gain:', value: `${activity.elevationGainM.toLocaleString()} m` },
          { id: 'm4', label: 'Ave Speed:', value: activity.avgPaceOrSpeed.includes('km') ? activity.avgPaceOrSpeed : '34.7 km/h' },
        ],
      });
    } else if (template === 'hiking_trek') {
      const peakM = activity.elevationProfile.length > 0
        ? Math.max(...activity.elevationProfile.map((p) => p.elevationM))
        : 2410;
      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Trail Dist:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Moving Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Total Ascent:', value: `+${activity.elevationGainM.toLocaleString()} m` },
          { id: 'm4', label: 'Peak Altitude:', value: `${peakM.toLocaleString()} m` },
        ],
      });
    } else if (template === 'running_marathon') {
      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Official Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Ave Pace:', value: activity.avgPaceOrSpeed || '4:45 /km' },
          { id: 'm4', label: 'Elevation Gain:', value: `+${activity.elevationGainM.toLocaleString()} m` },
        ],
      });
    } else if (template === 'trail_ultra') {
      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Total Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Elevation Gain:', value: `+${activity.elevationGainM.toLocaleString()} m` },
          { id: 'm4', label: 'Avg Heart Rate:', value: `${activity.avgHeartRate || 152} bpm` },
        ],
      });
    }
  };

  // Current metric values
  const currentMetrics = hudCard.customMetrics || [
    { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
    { id: 'm2', label: 'Time:', value: activity.durationFormatted },
    { id: 'm3', label: 'Elevation Gain:', value: `${activity.elevationGainM.toLocaleString()} m` },
    { id: 'm4', label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:', value: activity.avgPaceOrSpeed },
  ];

  const updateMetricRow = (index: number, key: 'label' | 'value', text: string) => {
    const updated = [...currentMetrics];
    updated[index] = { ...updated[index], [key]: text };
    onUpdateHudCard({ customMetrics: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. 3D GLASS HUD TELEMETRY PLAQUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>3D Glass HUD Plaque</span>
          </h3>
          <label className="flex items-center gap-1 text-[11px] text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hudCard.enabled}
              onChange={(e) => onUpdateHudCard({ enabled: e.target.checked })}
              className="accent-amber-400 rounded"
            />
            <span>Enabled</span>
          </label>
        </div>

        {hudCard.enabled && (
          <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-4">
            {/* ORIENTATION SELECTOR (Straight vs Slanted vs Custom) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">
                  Orientation & Perspective
                </label>
                <span className="text-[10px] font-mono text-amber-300">
                  {hudCard.orientation === 'straight'
                    ? 'Straight (Flat 0°)'
                    : hudCard.orientation === 'slanted_left'
                    ? 'Left Slanted (16°)'
                    : hudCard.orientation === 'slanted_right'
                    ? 'Right Slanted (-16°)'
                    : 'Custom 3D Angle'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-lg border border-white/10 text-xs">
                {[
                  { id: 'straight', label: 'Straight' },
                  { id: 'slanted_left', label: 'Left Slant' },
                  { id: 'slanted_right', label: 'Right Slant' },
                  { id: 'custom', label: 'Custom' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onUpdateHudCard({
                        orientation: opt.id as HudOrientation,
                        ...(opt.id === 'straight' ? { tiltY: 0, tiltX: 0 } : {}),
                        ...(opt.id === 'slanted_left' ? { tiltY: 16, tiltX: 18 } : {}),
                        ...(opt.id === 'slanted_right' ? { tiltY: -16, tiltX: 18 } : {}),
                      })
                    }
                    className={`py-1.5 px-2 text-center rounded font-medium transition-all ${
                      hudCard.orientation === opt.id
                        ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Slant Sliders (if custom selected) */}
            {hudCard.orientation === 'custom' && (
              <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-white/5 space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Horizontal Slant (Yaw)</span>
                    <span className="font-mono text-white">{hudCard.tiltY}°</span>
                  </div>
                  <input
                    type="range"
                    min="-35"
                    max="35"
                    step="1"
                    value={hudCard.tiltY}
                    onChange={(e) => onUpdateHudCard({ tiltY: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Ground Pitch (Tilt Back)</span>
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
            )}

            {/* GLASS FINISH & MATERIAL */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
                Glass Finish & Material
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {glassStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onUpdateHudCard({ style: style.id })}
                    className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                      hudCard.style === style.id
                        ? 'bg-amber-400/15 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-zinc-950/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* POSITION PRESETS (Safe Clamping - No Offscreen) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">
                  Screen Placement (Auto-Clamped)
                </label>
                <span className="text-[10px] font-mono text-zinc-500">Never Clips</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Bottom Left', x: 0.16, y: 0.70 },
                  { label: 'Bottom Right', x: 0.70, y: 0.70 },
                  { label: 'Top Left', x: 0.16, y: 0.15 },
                  { label: 'Top Right', x: 0.70, y: 0.15 },
                ].map((pos) => (
                  <button
                    key={pos.label}
                    onClick={() => onUpdateHudCard({ posX: pos.x, posY: pos.y })}
                    className="p-1.5 text-[10px] text-center rounded bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-zinc-300 transition-colors"
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position X / Y & Scale Sliders */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Offset X</span>
                  <span className="font-mono text-white">{Math.round(hudCard.posX * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  value={hudCard.posX}
                  onChange={(e) => onUpdateHudCard({ posX: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Offset Y</span>
                  <span className="font-mono text-white">{Math.round(hudCard.posY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  value={hudCard.posY}
                  onChange={(e) => onUpdateHudCard({ posY: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Scale</span>
                  <span className="font-mono text-white">{Math.round(hudCard.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  value={hudCard.scale}
                  onChange={(e) => onUpdateHudCard({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Glass Thickness & Opacity */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Glass Bevel Depth</span>
                  <span className="font-mono text-white">{hudCard.glassThickness}mm</span>
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

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Glass Opacity</span>
                  <span className="font-mono text-white">{Math.round(hudCard.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.02"
                  value={hudCard.opacity}
                  onChange={(e) => onUpdateHudCard({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Event Header Customizer */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Show Event Header on HUD</span>
                <input
                  type="checkbox"
                  checked={hudCard.showHeader !== false && hudCard.showStravaLogo !== false}
                  onChange={(e) => onUpdateHudCard({ showHeader: e.target.checked, showStravaLogo: e.target.checked })}
                  className="accent-amber-400 rounded"
                />
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
                      placeholder="e.g. GRAND FONDO"
                      className="w-full px-2 py-1 bg-zinc-950 border border-white/10 rounded text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-semibold"
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
                      className="w-full px-2 py-1 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. PLAQUE STATS & TELEMETRY INPUT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5" />
            <span>Plaque Stats & Telemetry Input</span>
          </h3>
          <button
            onClick={toggleUnitSystem}
            className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Toggle Units (km ↔ mi)</span>
          </button>
        </div>

        <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3">
          {/* Quick Sport Templates */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
              Quick Metric Templates
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'cycling_std', label: 'Cycling (Speed/Dist)' },
                { id: 'hiking_trek', label: 'Hiking & Trek (Ascent/Alt)' },
                { id: 'running_marathon', label: 'Running (Pace/Split)' },
                { id: 'trail_ultra', label: 'Trail Ultra (Elevation/HR)' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyPlaqueTemplate(tmpl.id as any)}
                  className="p-1.5 text-[10px] text-left rounded bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white transition-colors"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Telemetry Rows Direct Editor */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">
              Live Plaque Row Editor (Instant Sync)
            </span>

            {currentMetrics.map((row, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateMetricRow(idx, 'label', e.target.value)}
                    placeholder="Label:"
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateMetricRow(idx, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 3D GROUND ROUTE PROJECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>3D Ground Laser Route</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">Asphalt Surface</span>
        </div>

        {/* Laser Glow Color Swatches */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
            Laser Glow Color
          </label>
          <div className="flex items-center gap-2">
            {glowColors.map((c) => (
              <button
                key={c.hex}
                onClick={() => onUpdateSpatialRoute({ glowColor: c.hex })}
                className={`group relative flex-1 h-7 rounded-lg border transition-all ${
                  spatialRoute.glowColor === c.hex
                    ? 'border-white ring-2 ring-white/40 scale-105'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Perspective Pitch / Ground Tilt Slider */}
        <div className="p-3 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3">
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
              step="1"
              value={spatialRoute.tiltAngle}
              onChange={(e) => onUpdateSpatialRoute({ tiltAngle: parseInt(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>0° (Flat 2D Overhead)</span>
              <span>85° (Steep Road Surface)</span>
            </div>
          </div>

          {/* Road Yaw Rotation Slider */}
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
          <div className="grid grid-cols-2 gap-3 pt-1">
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
                <span className="text-zinc-400">Glow Intensity</span>
                <span className="font-mono text-white">{Math.round(spatialRoute.glowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={spatialRoute.glowIntensity}
                onChange={(e) => onUpdateSpatialRoute({ glowIntensity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Position X / Y */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Road Offset X</span>
                <span className="font-mono text-white">{Math.round(spatialRoute.posX * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.02"
                value={spatialRoute.posX}
                onChange={(e) => onUpdateSpatialRoute({ posX: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Road Offset Y</span>
                <span className="font-mono text-white">{Math.round(spatialRoute.posY * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.9"
                step="0.02"
                value={spatialRoute.posY}
                onChange={(e) => onUpdateSpatialRoute({ posY: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. CINEMATIC ATMOSPHERE & SPARKLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
            <Sun className="w-3.5 h-3.5" />
            <span>Cinematic Photo Grading</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'golden_hour', label: 'Golden Hour (RideJoburg)' },
            { id: 'natural_warm', label: 'Natural Daylight' },
            { id: 'high_contrast', label: 'High-Contrast Editorial' },
            { id: 'cyber_twilight', label: 'Cyber Twilight' },
          ].map((grade) => (
            <button
              key={grade.id}
              onClick={() =>
                onUpdateAtmosphere({
                  grade: grade.id as PhotoAtmosphereConfig['grade'],
                })
              }
              className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                atmosphere.grade === grade.id
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                  : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
