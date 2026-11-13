import React, { useState } from 'react';
import {
  ElevationOverlayConfig,
  HudCardConfig,
  RouteRenderMode,
  SpatialRouteConfig,
} from '../../types/poster';
import { V2PresetId, V2_VISUAL_PRESETS } from '../../data/v2Presets';
import {
  Sparkles,
  Palette,
  Layers,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Mountain,
  FileText,
} from 'lucide-react';

interface V2StyleSectionProps {
  activePreset: V2PresetId | null;
  onSelectPreset: (presetId: V2PresetId) => void;
  spatialRoute: SpatialRouteConfig;
  onUpdateSpatialRoute: (updated: Partial<SpatialRouteConfig>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  elevationConfig: ElevationOverlayConfig;
  onUpdateElevationConfig: (updated: Partial<ElevationOverlayConfig>) => void;
}

const COLOR_SWATCHES = [
  { label: 'Signature Orange', hex: '#FC5200' },
  { label: 'Solar Amber', hex: '#F59E0B' },
  { label: 'Crimson', hex: '#E11D48' },
  { label: 'Ocean Cyan', hex: '#0284C7' },
  { label: 'Alpine Emerald', hex: '#10B981' },
  { label: 'Gallery White', hex: '#F8FAFC' },
  { label: 'Obsidian', hex: '#000000' },
];

const GLASS_FINISHES: { id: HudCardConfig['style']; label: string; desc: string }[] = [
  { id: 'neon_rim', label: 'Smoked Glass', desc: 'Dark translucent with accent rim' },
  { id: 'frosted_ice', label: 'Frosted Light', desc: 'Bright crisp editorial finish' },
  { id: 'carbon_fiber', label: 'Matte Slate', desc: 'High-contrast dark plaque' },
  { id: 'transparent_line_color', label: 'Floating Type', desc: 'No card backing' },
];

export const V2StyleSection: React.FC<V2StyleSectionProps> = ({
  activePreset,
  onSelectPreset,
  spatialRoute,
  onUpdateSpatialRoute,
  hudCard,
  onUpdateHudCard,
  elevationConfig,
  onUpdateElevationConfig,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const signaturePreset = V2_VISUAL_PRESETS[0];
  const secondaryPresets = V2_VISUAL_PRESETS.slice(1);

  return (
    <div className="space-y-5">
      {/* 1. Visual Presets (Signature 3D Hero + Editorial + Map & Elevation) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Visual Presets</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">1-click looks</span>
        </div>

        {/* Hero Preset: Signature 3D */}
        <button
          type="button"
          onClick={() => onSelectPreset(signaturePreset.id)}
          className={`w-full relative overflow-hidden rounded-xl p-3.5 text-left border transition-all cursor-pointer group ${
            activePreset === signaturePreset.id
              ? 'bg-gradient-to-br from-[#FC5200]/20 via-amber-500/10 to-zinc-900 border-[#FC5200] shadow-[0_0_24px_-6px_rgba(252,82,0,0.45)]'
              : 'bg-gradient-to-br from-[#FC5200]/10 via-zinc-900/80 to-zinc-950 border-[#FC5200]/35 hover:border-[#FC5200]/75'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  {signaturePreset.name}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-[#FC5200] text-white font-semibold">
                  Signature
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {signaturePreset.tagline}
              </p>
            </div>

            {/* Mini 3D Route Preview Glyph */}
            <div className="w-14 h-11 rounded-lg bg-zinc-950/80 border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
              <svg viewBox="0 0 64 44" className="w-12 h-9" fill="none">
                <path
                  d="M10 34 Q 20 28, 28 30 T 42 18 T 54 12"
                  stroke="rgba(0,0,0,0.8)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="translate(1,3)"
                />
                <path
                  d="M10 34 Q 20 28, 28 30 T 42 18 T 54 12"
                  stroke="#FC5200"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M10 34 Q 20 28, 28 30 T 42 18 T 54 12"
                  stroke="#FFF7ED"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              {activePreset === signaturePreset.id && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FC5200] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Secondary Presets: Editorial & Map & Elevation */}
        <div className="grid grid-cols-2 gap-2">
          {secondaryPresets.map((preset) => {
            const isSelected = activePreset === preset.id;
            const Icon = preset.id === 'editorial' ? FileText : Mountain;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-zinc-800/90 border-[#FC5200] text-white shadow-sm'
                    : 'bg-zinc-900/55 border-white/[0.08] text-zinc-300 hover:bg-zinc-900 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#FC5200]' : 'text-zinc-400'
                    }`}
                  />
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#FC5200]/20 text-[#FC5200] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">
                    {preset.tagline}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Route Color & Glow Intensity */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Route Color &amp; Glow</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            {spatialRoute.glowColor}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {COLOR_SWATCHES.map((swatch) => {
            const selected =
              spatialRoute.glowColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => onUpdateSpatialRoute({ glowColor: swatch.hex })}
                title={swatch.label}
                className={`flex-1 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                  selected
                    ? 'border-white scale-105 ring-2 ring-[#FC5200]/40'
                    : 'border-white/10 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: swatch.hex }}
              />
            );
          })}

          <label
            className="w-9 h-8 rounded-lg border border-white/15 bg-zinc-900 flex items-center justify-center cursor-pointer relative overflow-hidden shrink-0"
            title="Custom color"
          >
            <input
              type="color"
              value={
                spatialRoute.glowColor.length === 7
                  ? spatialRoute.glowColor
                  : '#FC5200'
              }
              onChange={(e) =>
                onUpdateSpatialRoute({ glowColor: e.target.value })
              }
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span
              className="w-4 h-4 rounded-full border border-white/30"
              style={{
                background:
                  'conic-gradient(from 0deg, #FC5200, #FACC15, #10B981, #0284C7, #EC4899, #FC5200)',
              }}
            />
          </label>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.07] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-300 font-medium">
              Route Glow Intensity
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateSpatialRoute({
                  glowEnabled: spatialRoute.glowEnabled === false,
                })
              }
              className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                spatialRoute.glowEnabled !== false
                  ? 'bg-[#FC5200]/20 border-[#FC5200]/50 text-amber-200'
                  : 'bg-zinc-950 border-white/10 text-zinc-400'
              }`}
            >
              {spatialRoute.glowEnabled !== false ? 'Glow On' : 'Matte'}
            </button>
          </div>

          {spatialRoute.glowEnabled !== false && (
            <input
              type="range"
              min="0.2"
              max="2.2"
              step="0.1"
              value={spatialRoute.glowIntensity ?? 0.85}
              onChange={(e) =>
                onUpdateSpatialRoute({
                  glowIntensity: parseFloat(e.target.value),
                })
              }
              className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          )}
        </div>
      </section>

      {/* 3. Glass Statistics Panel Finish */}
      <section className="space-y-2.5 pt-4 border-t border-white/[0.08]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#FC5200]" />
          <span>Panel Finish</span>
        </h3>

        <div className="grid grid-cols-2 gap-1.5">
          {GLASS_FINISHES.map((finish) => {
            const active = hudCard.style === finish.id;
            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => onUpdateHudCard({ style: finish.id })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-zinc-800 border-[#FC5200] text-white'
                    : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="text-xs font-medium text-white block">
                  {finish.label}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5 leading-tight">
                  {finish.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Collapsed Advanced Rendering Controls */}
      <section className="pt-1">
        <div className="rounded-xl border border-white/[0.07] bg-zinc-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Advanced Route &amp; Glass Effects</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvanced && (
            <div className="px-3.5 pb-3.5 pt-2 space-y-3.5 border-t border-white/[0.06]">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">
                  Route Render Mode
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'molten_laser', label: 'Molten Laser' },
                      { id: 'volumetric_tube', label: 'Volumetric Tube' },
                      { id: 'laser_ribbon', label: 'Neon Ribbon' },
                      { id: 'minimal_vector', label: 'Minimal Vector' },
                    ] as { id: RouteRenderMode; label: string }[]
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        onUpdateSpatialRoute({ renderMode: mode.id })
                      }
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left cursor-pointer ${
                        (spatialRoute.renderMode || 'volumetric_tube') === mode.id
                          ? 'bg-zinc-800 border-[#FC5200] text-white'
                          : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Line Weight</span>
                  <span className="font-mono text-zinc-200">
                    {spatialRoute.lineWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.4"
                  value={spatialRoute.lineWidth}
                  onChange={(e) =>
                    onUpdateSpatialRoute({
                      lineWidth: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span className="text-[11px] text-zinc-300">
                  Ground Contact Shadow
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSpatialRoute({
                      shadowEnabled: spatialRoute.shadowEnabled === false,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                    spatialRoute.shadowEnabled !== false
                      ? 'bg-[#FC5200]/20 border-[#FC5200]/50 text-amber-200'
                      : 'bg-zinc-950 border-white/10 text-zinc-400'
                  }`}
                >
                  {spatialRoute.shadowEnabled !== false ? 'On' : 'Off'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Glass Frost &amp; Blur</span>
                  <span className="font-mono text-zinc-200">
                    {hudCard.glassmorphismIntensity ?? 75}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={hudCard.glassmorphismIntensity ?? 75}
                  onChange={(e) =>
                    onUpdateHudCard({
                      glassmorphismIntensity: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Elevation Ribbon Style</span>
                  <span className="font-mono text-zinc-300">
                    {elevationConfig.style === 'minimal_line' ? 'Line' : 'Ribbon'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'glass_ribbon', label: 'Shaded Ribbon' },
                      { id: 'minimal_line', label: 'Clean Line' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onUpdateElevationConfig({ style: st.id })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border cursor-pointer ${
                        elevationConfig.style === st.id
                          ? 'bg-zinc-800 border-[#FC5200] text-white'
                          : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
