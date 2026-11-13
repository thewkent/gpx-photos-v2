import React, { useState } from 'react';
import {
  ElevationOverlayConfig,
  HudCardConfig,
  HudOrientation,
  LogoCorner,
  SpatialRouteConfig,
} from '../../types/poster';
import {
  Compass,
  Layout,
  TrendingUp,
  Wand2,
  ChevronDown,
  Stamp,
  SlidersHorizontal,
} from 'lucide-react';

interface V2LayoutSectionProps {
  spatialRoute: SpatialRouteConfig;
  onUpdateSpatialRoute: (updated: Partial<SpatialRouteConfig>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  elevationConfig: ElevationOverlayConfig;
  onUpdateElevationConfig: (updated: Partial<ElevationOverlayConfig>) => void;
  logoCorner: LogoCorner;
  onUpdateLogoCorner: (corner: LogoCorner) => void;
  isWatermarkUnlocked: boolean;
  onAutoCompose: () => void;
  isAutoComposing: boolean;
}

const ROUTE_ANCHORS = [
  { label: 'Top Left', posX: 0.28, posY: 0.28 },
  { label: 'Top Right', posX: 0.72, posY: 0.28 },
  { label: 'Center', posX: 0.5, posY: 0.5 },
  { label: 'Ground Left', posX: 0.3, posY: 0.64 },
  { label: 'Ground Right', posX: 0.7, posY: 0.6 },
  { label: 'Lower Center', posX: 0.5, posY: 0.66 },
];

const HUD_ANCHORS = [
  { label: 'Top Left', posX: 0.06, posY: 0.08 },
  { label: 'Top Right', posX: 0.66, posY: 0.08 },
  { label: 'Bottom Left', posX: 0.06, posY: 0.66 },
  { label: 'Bottom Right', posX: 0.66, posY: 0.66 },
];

export const V2LayoutSection: React.FC<V2LayoutSectionProps> = ({
  spatialRoute,
  onUpdateSpatialRoute,
  hudCard,
  onUpdateHudCard,
  elevationConfig,
  onUpdateElevationConfig,
  logoCorner,
  onUpdateLogoCorner,
  isWatermarkUnlocked,
  onAutoCompose,
  isAutoComposing,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-5">
      {/* Quick Auto-Compose Bar */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#FC5200]/12 via-amber-500/5 to-zinc-900/80 border border-[#FC5200]/30 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-white block">Auto-Compose</span>
          <span className="text-[11px] text-zinc-400 block truncate">
            Place route &amp; stats in open photo space
          </span>
        </div>
        <button
          type="button"
          onClick={onAutoCompose}
          disabled={isAutoComposing}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FC5200] hover:bg-[#ff661a] text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isAutoComposing ? 'Composing...' : 'Auto'}</span>
        </button>
      </div>

      {/* 1. Route Placement */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Route Placement</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">
            Size {Math.round(spatialRoute.scale * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {ROUTE_ANCHORS.map((anchor) => {
            const isSelected =
              Math.abs(spatialRoute.posX - anchor.posX) < 0.06 &&
              Math.abs(spatialRoute.posY - anchor.posY) < 0.06;
            return (
              <button
                key={anchor.label}
                type="button"
                onClick={() =>
                  onUpdateSpatialRoute({ posX: anchor.posX, posY: anchor.posY })
                }
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 border-[#FC5200] text-white'
                    : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {anchor.label}
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.07] space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">Route Scale</span>
              <span className="font-mono text-zinc-200">
                {Math.round(spatialRoute.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.45"
              max="1.6"
              step="0.05"
              value={spatialRoute.scale}
              onChange={(e) =>
                onUpdateSpatialRoute({ scale: parseFloat(e.target.value) })
              }
              className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Horizontal</span>
                <span className="font-mono text-zinc-300">
                  {Math.round(spatialRoute.posX * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.02"
                value={spatialRoute.posX}
                onChange={(e) =>
                  onUpdateSpatialRoute({ posX: parseFloat(e.target.value) })
                }
                className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Vertical</span>
                <span className="font-mono text-zinc-300">
                  {Math.round(spatialRoute.posY * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.92"
                step="0.02"
                value={spatialRoute.posY}
                onChange={(e) =>
                  onUpdateSpatialRoute({ posY: parseFloat(e.target.value) })
                }
                className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Panel Placement */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Statistics Panel</span>
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[11px] text-zinc-400">Visible</span>
            <input
              type="checkbox"
              checked={hudCard.enabled}
              onChange={(e) => onUpdateHudCard({ enabled: e.target.checked })}
              className="accent-[#FC5200] rounded cursor-pointer"
            />
          </label>
        </div>

        {hudCard.enabled && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {HUD_ANCHORS.map((anchor) => {
                const isSelected =
                  Math.abs(hudCard.posX - anchor.posX) < 0.08 &&
                  Math.abs(hudCard.posY - anchor.posY) < 0.08;
                return (
                  <button
                    key={anchor.label}
                    type="button"
                    onClick={() =>
                      onUpdateHudCard({ posX: anchor.posX, posY: anchor.posY })
                    }
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-[#FC5200] text-white'
                        : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {anchor.label}
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.07] space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Panel Size</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(hudCard.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.6"
                  step="0.05"
                  value={hudCard.scale}
                  onChange={(e) =>
                    onUpdateHudCard({ scale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Left / Right</span>
                    <span className="font-mono text-zinc-300">
                      {Math.round(hudCard.posX * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.82"
                    step="0.01"
                    value={hudCard.posX}
                    onChange={(e) =>
                      onUpdateHudCard({ posX: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Up / Down</span>
                    <span className="font-mono text-zinc-300">
                      {Math.round(hudCard.posY * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.88"
                    step="0.01"
                    value={hudCard.posY}
                    onChange={(e) =>
                      onUpdateHudCard({ posY: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Elevation Profile */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Elevation Profile</span>
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[11px] text-zinc-400">Visible</span>
            <input
              type="checkbox"
              checked={elevationConfig.enabled}
              onChange={(e) =>
                onUpdateElevationConfig({ enabled: e.target.checked })
              }
              className="accent-[#FC5200] rounded cursor-pointer"
            />
          </label>
        </div>

        {elevationConfig.enabled && (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Bottom Edge', posY: 0.96 },
              { label: 'Lower Ribbon', posY: 0.92 },
              { label: 'Raised', posY: 0.84 },
            ].map((pos) => {
              const active = Math.abs(elevationConfig.posY - pos.posY) < 0.025;
              return (
                <button
                  key={pos.label}
                  type="button"
                  onClick={() => onUpdateElevationConfig({ posY: pos.posY })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-zinc-800 border-[#FC5200] text-white'
                      : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Free Edition Attribution Corner */}
      {!isWatermarkUnlocked && (
        <section className="space-y-2.5 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Stamp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Attribution Badge Corner</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { id: 'top-left', label: 'Top L' },
                { id: 'top-right', label: 'Top R' },
                { id: 'bottom-left', label: 'Bot L' },
                { id: 'bottom-right', label: 'Bot R' },
              ] as const
            ).map((corner) => (
              <button
                key={corner.id}
                type="button"
                onClick={() => onUpdateLogoCorner(corner.id)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  logoCorner === corner.id
                    ? 'bg-zinc-800 border-[#FC5200] text-white'
                    : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white'
                }`}
              >
                {corner.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. Collapsed Advanced Perspective & Geometry */}
      <section className="pt-2">
        <div className="rounded-xl border border-white/[0.07] bg-zinc-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Advanced Perspective &amp; Geometry</span>
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
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Ground Perspective Tilt</span>
                  <span className="font-mono text-zinc-200">{spatialRoute.tiltAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  step="1"
                  value={spatialRoute.tiltAngle}
                  onChange={(e) =>
                    onUpdateSpatialRoute({ tiltAngle: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Route Rotation (Yaw)</span>
                  <span className="font-mono text-zinc-200">{spatialRoute.yawAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="2"
                  value={spatialRoute.yawAngle}
                  onChange={(e) =>
                    onUpdateSpatialRoute({ yawAngle: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">3D Elevation Relief (Z-Lift)</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round((spatialRoute.elevation3dScale ?? 0.35) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={spatialRoute.elevation3dScale ?? 0.35}
                  onChange={(e) =>
                    onUpdateSpatialRoute({
                      elevation3dScale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {hudCard.enabled && (
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1.5">
                    Statistics Panel Slant
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'straight', label: 'Flat', tiltY: 0, tiltX: 0 },
                        { id: 'slanted_left', label: 'Left Tilt', tiltY: 16, tiltX: 18 },
                        { id: 'slanted_right', label: 'Right Tilt', tiltY: -16, tiltX: 18 },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onUpdateHudCard({
                            orientation: opt.id as HudOrientation,
                            tiltY: opt.tiltY,
                            tiltX: opt.tiltX,
                          })
                        }
                        className={`py-1 px-2 rounded text-[11px] font-medium border cursor-pointer ${
                          hudCard.orientation === opt.id
                            ? 'bg-zinc-800 border-[#FC5200] text-white'
                            : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {elevationConfig.enabled && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/[0.05]">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Elevation Height</span>
                      <span className="font-mono text-zinc-200">
                        {elevationConfig.height}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="28"
                      max="130"
                      step="2"
                      value={elevationConfig.height}
                      onChange={(e) =>
                        onUpdateElevationConfig({
                          height: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400">Elevation Width</span>
                      <span className="font-mono text-zinc-200">
                        {Math.round(elevationConfig.widthPercent * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="0.96"
                      step="0.02"
                      value={elevationConfig.widthPercent}
                      onChange={(e) =>
                        onUpdateElevationConfig({
                          widthPercent: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
