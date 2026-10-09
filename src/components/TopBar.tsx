import React from 'react';
import { GpxPhotosLogo } from './GpxPhotosLogo';
import { Download, Sparkles, Unlock, Share2, Check, Zap } from 'lucide-react';

interface TopBarProps {
  onOpenOrder: () => void;
  onExportPng: (unwatermarked?: boolean) => void;
  isExporting: boolean;
  isWatermarkUnlocked: boolean;
  onGoHome?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenOrder,
  onExportPng,
  isExporting,
  isWatermarkUnlocked,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#121215]/95 backdrop-blur-md border-b border-white/[0.08]">
      {/* Brand: gpx.photos */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group cursor-pointer bg-transparent border-0 p-0 text-left"
          title="Back to Landing Page & Overview"
        >
          <GpxPhotosLogo variant="horizontal" theme="dark" size={32} />
        </button>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-md border border-white/10 transition-colors cursor-pointer"
          >
            <span>Overview & FAQ</span>
          </button>
        )}
      </div>

      {/* Zone 2: Actions - Free Download with Logo vs $10 Paystack Unbrand */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Free Promo Watermarked Download */}
        <button
          onClick={() => onExportPng(false)}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer shadow-xs"
          title="Download free image with gpx.photos logo for social sharing & club feeds"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isExporting ? 'Exporting...' : 'Free Download (with Logo)'}</span>
        </button>

        {/* 300 DPI Export */}
        <button
          onClick={() => onExportPng(isWatermarkUnlocked)}
          disabled={isExporting}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700/90 border border-white/10 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>300 DPI</span>
        </button>

        {/* Paid Option ($10 via Paystack to Remove Branding) */}
        {!isWatermarkUnlocked ? (
          <button
            onClick={onOpenOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-md hover:shadow-amber-400/20 whitespace-nowrap cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Remove Branding ($10)</span>
          </button>
        ) : (
          <button
            onClick={() => onExportPng(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md whitespace-nowrap cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Download Clean Master</span>
          </button>
        )}
      </div>
    </header>
  );
};
