import React, { useRef, useEffect, useState } from 'react';
import {
  StravaActivityData,
  SpatialRouteConfig,
  HudCardConfig,
  PhotoAtmosphereConfig,
  ElevationOverlayConfig,
  LogoCorner,
} from '../types/poster';
import { renderSpatialArtwork } from '../utils/canvasRenderer';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PosterCanvasProps {
  activity: StravaActivityData;
  spatialRoute: SpatialRouteConfig;
  hudCard: HudCardConfig;
  atmosphere: PhotoAtmosphereConfig;
  elevationConfig?: ElevationOverlayConfig;
  photoUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isWatermarked?: boolean;
  logoCorner?: LogoCorner;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  activity,
  spatialRoute,
  hudCard,
  atmosphere,
  elevationConfig,
  photoUrl,
  canvasRef,
  isWatermarked = true,
  logoCorner = 'top-right',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);

  // Preload photo
  useEffect(() => {
    if (!photoUrl) {
      setPhotoImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;
    img.onload = () => {
      setPhotoImage(img);
    };
  }, [photoUrl]);

  // 100% uncropped native photo aspect ratio
  const activeAspect =
    photoImage && photoImage.naturalWidth > 0
      ? photoImage.naturalWidth / photoImage.naturalHeight
      : 3 / 2;

  // Re-render spatial artwork on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Base dimensions matching exact photo aspect ratio with zero cropping
    const baseW = 960;
    const baseH = Math.round(baseW / activeAspect);

    renderSpatialArtwork({
      canvas,
      width: baseW,
      height: baseH,
      activity,
      spatialRoute,
      hudCard,
      atmosphere,
      elevationConfig,
      photoImage,
      highDpiScale: window.devicePixelRatio || 2,
      isWatermarked,
      logoCorner,
    });
  }, [activity, spatialRoute, hudCard, atmosphere, elevationConfig, photoImage, isWatermarked, logoCorner, activeAspect, canvasRef]);

  return (
    <div className="flex flex-col h-full items-center justify-between p-4 sm:p-6 select-none">
      {/* Top Floating Control Bar */}
      <div className="w-full flex items-center justify-end max-w-xl gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 text-zinc-400 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg ml-auto">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-10 text-center text-zinc-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors ml-1"
            title="Reset fit"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-auto w-full">
        <div
          className="transition-all duration-300 flex items-center justify-center p-0 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] border border-white/10 rounded-sm"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-[72vh] object-contain transition-all rounded-xs"
            style={{
              aspectRatio: `${activeAspect}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
