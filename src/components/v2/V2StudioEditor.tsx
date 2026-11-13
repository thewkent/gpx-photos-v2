import React, { useState } from 'react';
import {
  ActivityData,
  ElevationOverlayConfig,
  HudCardConfig,
  LogoCorner,
  PhotoAtmosphereConfig,
  SpatialRouteConfig,
} from '../../types/poster';
import { V2PresetId, V2_VISUAL_PRESETS } from '../../data/v2Presets';
import { analyzeAndAutoStyle } from '../../utils/autoStyler';
import { GpxPhotosLogo } from '../GpxPhotosLogo';
import { PosterCanvas } from '../PosterCanvas';
import { V2PhotoSection } from './V2PhotoSection';
import { V2LayoutSection } from './V2LayoutSection';
import { V2StyleSection } from './V2StyleSection';
import { V2StatisticsSection } from './V2StatisticsSection';
import { AIArtworkSection } from './AIArtworkSection';
import {
  Image as ImageIcon,
  LayoutGrid,
  Sparkles,
  BarChart3,
  Download,
  Unlock,
  Check,
  Wand2,
  Sliders,
} from 'lucide-react';

export type V2EditorTab = 'photo' | 'layout' | 'style' | 'statistics' | 'ai-art';

interface V2StudioEditorProps {
  activity: ActivityData;
  onUpdateActivity: (updated: Partial<ActivityData>) => void;
  photoUrl: string;
  onSelectPhoto: (url: string) => void;
  spatialRoute: SpatialRouteConfig;
  onUpdateSpatialRoute: (updated: Partial<SpatialRouteConfig>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  atmosphere: PhotoAtmosphereConfig;
  onUpdateAtmosphere: (updated: Partial<PhotoAtmosphereConfig>) => void;
  elevationConfig: ElevationOverlayConfig;
  onUpdateElevationConfig: (updated: Partial<ElevationOverlayConfig>) => void;
  logoCorner: LogoCorner;
  onUpdateLogoCorner: (corner: LogoCorner) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isExporting: boolean;
  isWatermarkUnlocked: boolean;
  onExportPng: (forceUnwatermarked?: boolean) => void;
  onOpenOrder: () => void;
  onGoHome: () => void;
  onSwitchToClassic: () => void;
  activePreset: V2PresetId | null;
  onSelectPreset: (presetId: V2PresetId) => void;
}

const SECTION_TABS: {
  id: V2EditorTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'photo', label: 'Photo', icon: ImageIcon },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'style', label: 'Style', icon: Sparkles },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'ai-art', label: 'AI Art', icon: Wand2 },
];

export const V2StudioEditor: React.FC<V2StudioEditorProps> = ({
  activity,
  onUpdateActivity,
  photoUrl,
  onSelectPhoto,
  spatialRoute,
  onUpdateSpatialRoute,
  hudCard,
  onUpdateHudCard,
  atmosphere,
  onUpdateAtmosphere,
  elevationConfig,
  onUpdateElevationConfig,
  logoCorner,
  onUpdateLogoCorner,
  canvasRef,
  isExporting,
  isWatermarkUnlocked,
  onExportPng,
  onOpenOrder,
  onGoHome,
  onSwitchToClassic,
  activePreset,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<V2EditorTab>('style');
  const [isAutoComposing, setIsAutoComposing] = useState(false);

  const handleAutoCompose = async () => {
    setIsAutoComposing(true);
    try {
      const result = await analyzeAndAutoStyle(photoUrl, activity);
      if (result.spatialRoute) {
        onUpdateSpatialRoute({
          posX: result.spatialRoute.posX ?? spatialRoute.posX,
          posY: result.spatialRoute.posY ?? spatialRoute.posY,
          scale: result.spatialRoute.scale ?? spatialRoute.scale,
        });
      }
      if (result.hudCard) {
        onUpdateHudCard({
          posX: result.hudCard.posX ?? hudCard.posX,
          posY: result.hudCard.posY ?? hudCard.posY,
        });
      }
    } finally {
      setIsAutoComposing(false);
    }
  };

  const previewToolbar = (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-lg">
        {V2_VISUAL_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;
          const isSignature = preset.id === 'signature_3d';
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? isSignature
                    ? 'bg-[#FC5200] text-white font-semibold shadow-sm'
                    : 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isSignature && (
                <Sparkles
                  className={`w-3 h-3 ${
                    isSelected ? 'text-white' : 'text-[#FC5200]'
                  }`}
                />
              )}
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAutoCompose}
        disabled={isAutoComposing}
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md border border-white/10 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors shadow-lg cursor-pointer disabled:opacity-50"
        title="Automatically place route and stats in open space"
      >
        <Wand2 className="w-3.5 h-3.5 text-[#FC5200]" />
        <span>{isAutoComposing ? 'Composing...' : 'Auto-Compose'}</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-[#F4F4F5] font-sans antialiased">
      {/* Compact Top Header */}
      <header className="sticky top-0 z-40 h-14 px-4 sm:px-6 bg-[#111114]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer shrink-0"
            title="Return to Overview"
          >
            <GpxPhotosLogo variant="horizontal" theme="dark" size={28} />
          </button>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
            Studio V2
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onSwitchToClassic}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] transition-colors cursor-pointer"
            title="Switch to classic V1 controls"
          >
            <Sliders className="w-3 h-3" />
            <span>Classic Editor</span>
          </button>

          {!isWatermarkUnlocked && (
            <button
              type="button"
              onClick={onOpenOrder}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              <span>Clean 4K ($10)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onExportPng(isWatermarkUnlocked)}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#FC5200] to-amber-500 hover:from-[#ff661a] hover:to-amber-400 shadow-md shadow-[#FC5200]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExporting
                ? 'Exporting...'
                : isWatermarkUnlocked
                ? 'Download 4K'
                : 'Download'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace: Large Central Photo Preview + Compact Editing Panel */}
      <main className="flex-1 flex flex-col lg:flex-row lg:h-[calc(100vh-56px)] lg:overflow-hidden">
        {/* Large Central Photograph Preview */}
        <section className="relative flex-1 min-w-0 bg-[#08090C] flex flex-col justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
          {/* Subtle Ambient Studio Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(252,82,0,0.06),transparent_65%)]" />

          <PosterCanvas
            activity={activity}
            spatialRoute={spatialRoute}
            hudCard={hudCard}
            atmosphere={atmosphere}
            elevationConfig={elevationConfig}
            photoUrl={photoUrl}
            canvasRef={canvasRef}
            isWatermarked={!isWatermarkUnlocked}
            logoCorner={logoCorner}
            containerClassName="p-3 sm:p-5 lg:p-6"
            canvasMaxHeightClass="max-h-[48vh] sm:max-h-[56vh] lg:max-h-[79vh]"
            toolbarExtras={previewToolbar}
            renderEngine="signature"
          />
        </section>

        {/* Compact Editing Panel */}
        <aside className="w-full lg:w-[390px] xl:w-[410px] shrink-0 bg-[#121215] flex flex-col lg:h-full">
          {/* 4 Organised Section Tabs */}
          <div className="p-3 bg-[#141418] border-b border-white/[0.08] shrink-0">
            <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-950 rounded-xl border border-white/[0.08]">
              {SECTION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-[#FC5200]' : 'text-zinc-500'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Controls */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeTab === 'photo' && (
              <V2PhotoSection
                currentPhotoUrl={photoUrl}
                onSelectPhoto={onSelectPhoto}
                activity={activity}
                onUpdateActivity={onUpdateActivity}
                hudCard={hudCard}
                onUpdateHudCard={onUpdateHudCard}
                atmosphere={atmosphere}
                onUpdateAtmosphere={onUpdateAtmosphere}
              />
            )}

            {activeTab === 'layout' && (
              <V2LayoutSection
                spatialRoute={spatialRoute}
                onUpdateSpatialRoute={onUpdateSpatialRoute}
                hudCard={hudCard}
                onUpdateHudCard={onUpdateHudCard}
                elevationConfig={elevationConfig}
                onUpdateElevationConfig={onUpdateElevationConfig}
                logoCorner={logoCorner}
                onUpdateLogoCorner={onUpdateLogoCorner}
                isWatermarkUnlocked={isWatermarkUnlocked}
                onAutoCompose={handleAutoCompose}
                isAutoComposing={isAutoComposing}
              />
            )}

            {activeTab === 'style' && (
              <V2StyleSection
                activePreset={activePreset}
                onSelectPreset={onSelectPreset}
                spatialRoute={spatialRoute}
                onUpdateSpatialRoute={onUpdateSpatialRoute}
                hudCard={hudCard}
                onUpdateHudCard={onUpdateHudCard}
                elevationConfig={elevationConfig}
                onUpdateElevationConfig={onUpdateElevationConfig}
              />
            )}

            {activeTab === 'statistics' && (
              <V2StatisticsSection
                activity={activity}
                onUpdateActivity={onUpdateActivity}
                hudCard={hudCard}
                onUpdateHudCard={onUpdateHudCard}
              />
            )}

            {activeTab === 'ai-art' && (
              <AIArtworkSection photoUrl={photoUrl} onSelectPhoto={onSelectPhoto} activity={activity} />
            )}
          </div>

          {/* Sticky Prominent Download Footer */}
          <div className="p-4 bg-[#0D0D10]/95 backdrop-blur-md border-t border-white/[0.08] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">
                {isWatermarkUnlocked ? (
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Clean Master Unlocked
                  </span>
                ) : (
                  'Free social export (includes gpx.photos badge)'
                )}
              </span>
              {!isWatermarkUnlocked && (
                <button
                  type="button"
                  onClick={onOpenOrder}
                  className="text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
                >
                  Remove logo ($10)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onExportPng(isWatermarkUnlocked)}
                disabled={isExporting}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FC5200] to-amber-500 hover:from-[#ff661a] hover:to-amber-400 shadow-lg shadow-[#FC5200]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting
                    ? 'Preparing High-Res PNG...'
                    : isWatermarkUnlocked
                    ? 'Download Clean Master PNG'
                    : 'Download Photo'}
                </span>
              </button>

              {!isWatermarkUnlocked && (
                <button
                  type="button"
                  onClick={onOpenOrder}
                  className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-amber-200 bg-zinc-900 hover:bg-zinc-800 border border-amber-400/35 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Unlock clean unbranded 4K export via Paystack"
                >
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>$10</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
