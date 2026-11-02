/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { PosterCanvas } from './components/PosterCanvas';
import { UploadTab } from './components/UploadTab';
import { OverlayTab } from './components/OverlayTab';
import { FulfillmentModal } from './components/FulfillmentModal';
import { LandingPage } from './components/LandingPage';
import { EventLandingPage } from './components/EventLandingPage';
import { FEATURED_EVENTS, RIDE_JOBURG_EVENT, EventPreset } from './data/eventCatalog';
import {
  SAMPLE_ACTIVITIES,
  DEFAULT_SPATIAL_CONFIG,
  DEFAULT_HUD_CONFIG,
  DEFAULT_ATMOSPHERE_CONFIG,
  DEFAULT_ELEVATION_CONFIG,
  ASSETS,
} from './data/sampleRoutes';
import {
  ActivityData,
  SpatialRouteConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  ElevationOverlayConfig,
  LogoCorner,
} from './types/poster';
import { renderSpatialArtwork } from './utils/canvasRenderer';
import { UploadCloud, Layers, Unlock, Download, Share2, Check } from 'lucide-react';

export default function App() {
  // Option C: Dedicated Landing Page vs Studio Workspace vs Event Page state
  const [selectedEvent, setSelectedEvent] = useState<EventPreset | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('#event/ride-joburg')) {
        return RIDE_JOBURG_EVENT;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'event' | 'studio'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/studio') || path.includes('/app') || hash === '#studio') {
        return 'studio';
      }
      if (hash.startsWith('#event/')) {
        return 'event';
      }
    }
    return 'landing';
  });

  const [sidebarTab, setSidebarTab] = useState<'upload' | 'overlay'>('upload');

  // Handle browser back/forward and hash navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (path.includes('/studio') || path.includes('/app') || hash === '#studio') {
        setCurrentView('studio');
      } else if (hash.startsWith('#event/')) {
        const slug = hash.replace('#event/', '');
        const found = FEATURED_EVENTS.find((e) => e.slug === slug);
        if (found) {
          setSelectedEvent(found);
          setCurrentView('event');
        } else {
          setCurrentView('landing');
        }
      } else {
        setCurrentView('landing');
      }
    };

    // Handle path routes for about, contact, terms, privacy
    if (['/about', '/contact', '/terms', '/privacy'].includes(window.location.pathname)) {
      window.location.hash = window.location.pathname.replace('/', '#');
    }

    const handleWebMcpOverlay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.style) setHudCard((prev) => ({ ...prev, style: detail.style }));
      if (detail.cardScale) setHudCard((prev) => ({ ...prev, scale: detail.cardScale }));
      if (detail.verticalPosition !== undefined) setHudCard((prev) => ({ ...prev, posY: detail.verticalPosition }));
      if (detail.routeColor) setSpatialRoute((prev) => ({ ...prev, glowColor: detail.routeColor }));
      if (detail.renderMode) setSpatialRoute((prev) => ({ ...prev, renderMode: detail.renderMode }));
    };
    window.addEventListener('webmcp:apply-overlay', handleWebMcpOverlay);

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('webmcp:apply-overlay', handleWebMcpOverlay);
    };
  }, []);

  const navigateToStudio = () => {
    setCurrentView('studio');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '#studio');
      window.scrollTo(0, 0);
    }
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    setSelectedEvent(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
      window.scrollTo(0, 0);
    }
  };

  const navigateToEvent = (evt: EventPreset) => {
    setSelectedEvent(evt);
    setCurrentView('event');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `#event/${evt.slug}`);
      window.scrollTo(0, 0);
    }
  };

  // Loads an event's sample track, activity, and plaque layout straight into the Studio workspace
  const openStudioWithEventPreset = (evt: EventPreset) => {
    setCurrentActivity(evt.sampleActivity);
    setPhotoUrl(evt.samplePhotoUrl);
    setSpatialRoute((prev) => ({ ...prev, ...evt.spatialPreset }));
    setHudCard((prev) => ({ ...prev, ...evt.hudPreset }));
    if (evt.elevationPreset) {
      setElevationConfig((prev) => ({ ...prev, ...evt.elevationPreset }));
    }
    if (evt.atmospherePreset) {
      setAtmosphere((prev) => ({ ...prev, ...evt.atmospherePreset }));
    }
    navigateToStudio();
  };

  // Core Activity & Scene State
  const [currentActivity, setCurrentActivity] = useState<ActivityData>(SAMPLE_ACTIVITIES[0]);
  const [photoUrl, setPhotoUrl] = useState<string>(ASSETS.sydneyMarathon);
  const [spatialRoute, setSpatialRoute] = useState<SpatialRouteConfig>(DEFAULT_SPATIAL_CONFIG);
  const [hudCard, setHudCard] = useState<HudCardConfig>(DEFAULT_HUD_CONFIG);
  const [atmosphere, setAtmosphere] = useState<PhotoAtmosphereConfig>(DEFAULT_ATMOSPHERE_CONFIG);
  const [elevationConfig, setElevationConfig] = useState<ElevationOverlayConfig>(DEFAULT_ELEVATION_CONFIG);
  const [logoCorner, setLogoCorner] = useState<LogoCorner>('top-right');

  // Digital Monetization & Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isWatermarkUnlocked, setIsWatermarkUnlocked] = useState(false);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-Resolution 300 DPI Export Handler
  const handleExportPng = (forceUnwatermarked?: boolean) => {
    setIsExporting(true);
    const shouldOmitWatermark = forceUnwatermarked === true || isWatermarkUnlocked;

    setTimeout(() => {
      try {
        const exportCanvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = photoUrl;

        const executeExport = (photoImg: HTMLImageElement | null) => {
          const previewCanvas = canvasRef.current;

          // Obtain exact aspect ratio directly from the active preview canvas or photo
          const activeAspect =
            previewCanvas && previewCanvas.width > 0 && previewCanvas.height > 0
              ? previewCanvas.width / previewCanvas.height
              : (photoImg && photoImg.naturalWidth > 0
                  ? photoImg.naturalWidth / photoImg.naturalHeight
                  : 3 / 2);

          // Base coordinate space is 100% identical to screen preview (960 x baseH)
          const baseW = 960;
          const baseH = Math.round(baseW / activeAspect);

          // 4x high-DPI scaling produces a 3840px master print while preserving 100% preview proportions
          const printDpiScale = 4;

          renderSpatialArtwork({
            canvas: exportCanvas,
            width: baseW,
            height: baseH,
            activity: currentActivity,
            spatialRoute,
            hudCard,
            atmosphere,
            elevationConfig,
            photoImage: photoImg,
            highDpiScale: printDpiScale,
            isWatermarked: !shouldOmitWatermark,
            logoCorner,
          });

          exportCanvas.toBlob((blob) => {
            if (!blob) {
              setIsExporting(false);
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const slug = currentActivity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const modeSuffix = shouldOmitWatermark ? 'unbranded-master-300dpi' : 'social-gpx-art';
            a.download = `gpx-art-${slug}-${modeSuffix}.png`;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setIsExporting(false);
          }, 'image/png');
        };

        if (img.complete && img.naturalWidth > 0) {
          executeExport(img);
        } else {
          img.onload = () => executeExport(img);
          img.onerror = () => executeExport(null);
        }
      } catch (err) {
        console.error('Export failed:', err);
        setIsExporting(false);
      }
    }, 100);
  };

  // If in Landing Mode, render the LandingPage
  if (currentView === 'landing') {
    return (
      <LandingPage
        onOpenStudio={navigateToStudio}
        onOpenEvent={navigateToEvent}
      />
    );
  }

  // If in Event Page Mode, render the EventLandingPage
  if (currentView === 'event' && selectedEvent) {
    return (
      <EventLandingPage
        event={selectedEvent}
        onOpenStudioWithEvent={openStudioWithEventPreset}
        onBackToMainLanding={navigateToLanding}
      />
    );
  }

  // Otherwise render the full Studio Workspace
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F11] text-[#F3F3F5] font-sans antialiased">
      {/* Top Bar with Brand, Navigation, Free Export & $10 Paystack Unbrand */}
      <TopBar
        onOpenOrder={() => setIsOrderModalOpen(true)}
        onExportPng={handleExportPng}
        isExporting={isExporting}
        isWatermarkUnlocked={isWatermarkUnlocked}
        onGoHome={navigateToLanding}
      />

      {/* Main Content Workspace: Digital Canvas (left) + Control Inspector (right) */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-57px)]">
          {/* Left/Center: Spatial Canvas Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[#090A0C] border-b lg:border-b-0 lg:border-r border-white/[0.08] relative overflow-hidden">
            <PosterCanvas
              activity={currentActivity}
              spatialRoute={spatialRoute}
              hudCard={hudCard}
              atmosphere={atmosphere}
              elevationConfig={elevationConfig}
              photoUrl={photoUrl}
              canvasRef={canvasRef}
              isWatermarked={!isWatermarkUnlocked}
              logoCorner={logoCorner}
            />
          </div>

          {/* Right: Studio Controls & 3D Parameters (4 cols) */}
          <div className="lg:col-span-4 flex flex-col bg-[#141417] divide-y divide-white/[0.08] overflow-y-auto max-h-[calc(100vh-57px)]">
            {/* Inspector Header / Tabs */}
            <div className="p-3 bg-zinc-900/60 sticky top-0 z-10 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-lg border border-white/10">
                <button
                  onClick={() => setSidebarTab('upload')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    sidebarTab === 'upload'
                      ? 'bg-zinc-800 text-amber-300 shadow-sm border border-amber-400/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>1. Photo & GPX</span>
                </button>

                <button
                  onClick={() => setSidebarTab('overlay')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    sidebarTab === 'overlay'
                      ? 'bg-zinc-800 text-amber-300 shadow-sm border border-amber-400/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. GPX Overlay</span>
                </button>
              </div>
            </div>

            {/* Inspector Content Panel */}
            <div className="p-5 flex-1 space-y-6">
              {sidebarTab === 'upload' && (
                <UploadTab
                  currentPhotoUrl={photoUrl}
                  onSelectPhoto={(url) => setPhotoUrl(url)}
                  activity={currentActivity}
                  onUpdateActivity={(up) => setCurrentActivity((prev) => ({ ...prev, ...up }))}
                  hudCard={hudCard}
                  onUpdateHudCard={(up) => setHudCard((prev) => ({ ...prev, ...up }))}
                  atmosphere={atmosphere}
                  onUpdateAtmosphere={(up) => setAtmosphere((prev) => ({ ...prev, ...up }))}
                  onApplyPresetAlignment={(spatial, hud) => {
                    setSpatialRoute((prev) => ({ ...prev, ...spatial }));
                    setHudCard((prev) => ({ ...prev, ...hud }));
                  }}
                  onContinueToOverlay={() => setSidebarTab('overlay')}
                />
              )}

              {sidebarTab === 'overlay' && (
                <OverlayTab
                  activity={currentActivity}
                  onUpdateActivity={(up) => setCurrentActivity((prev) => ({ ...prev, ...up }))}
                  spatialRoute={spatialRoute}
                  onUpdateSpatialRoute={(up) => setSpatialRoute((prev) => ({ ...prev, ...up }))}
                  hudCard={hudCard}
                  onUpdateHudCard={(up) => setHudCard((prev) => ({ ...prev, ...up }))}
                  elevationConfig={elevationConfig}
                  onUpdateElevationConfig={(up) => setElevationConfig((prev) => ({ ...prev, ...up }))}
                  logoCorner={logoCorner}
                  onUpdateLogoCorner={(c) => setLogoCorner(c)}
                />
              )}
            </div>

            {/* Digital License & Action Sticky Footer */}
            <div className="p-4 bg-zinc-950/90 mt-auto flex items-center justify-between border-t border-white/10 gap-3">
              <div className="text-xs">
                <span className="text-zinc-500 block font-mono text-[10px] uppercase">
                  License Status
                </span>
                {!isWatermarkUnlocked ? (
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-xs">
                    Free (with gpx.photos logo)
                  </span>
                ) : (
                  <span className="font-semibold text-amber-300 flex items-center gap-1 font-mono text-xs">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> Unbranded 4K Master
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isWatermarkUnlocked ? (
                  <>
                    <button
                      onClick={() => handleExportPng(false)}
                      disabled={isExporting}
                      className="px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download free image with gpx.photos logo"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Free Download</span>
                    </button>

                    <button
                      onClick={() => setIsOrderModalOpen(true)}
                      className="px-3.5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Remove Branding ($10)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleExportPng(true)}
                    disabled={isExporting}
                    className="px-4 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Clean Master</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Paystack Watermark Removal & Master Download Modal */}
      <FulfillmentModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        activity={currentActivity}
        onExportPng={handleExportPng}
        isExporting={isExporting}
        isWatermarkUnlocked={isWatermarkUnlocked}
        onUnlockWatermark={() => setIsWatermarkUnlocked(true)}
      />
    </div>
  );
}
