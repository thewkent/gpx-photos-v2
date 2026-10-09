import React, { useRef } from 'react';
import { ASSETS, DEFAULT_SPATIAL_CONFIG, DEFAULT_HUD_CONFIG } from '../data/sampleRoutes';
import { SpatialRouteConfig, HudCardConfig } from '../types/poster';
import { UploadCloud, Check, Sparkles } from 'lucide-react';

interface PhotoUploaderProps {
  currentPhotoUrl: string;
  onSelectPhoto: (url: string) => void;
  onApplyPresetAlignment?: (spatial: Partial<SpatialRouteConfig>, hud: Partial<HudCardConfig>) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentPhotoUrl,
  onSelectPhoto,
  onApplyPresetAlignment,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onSelectPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
          Athlete Photography
        </h3>
        <span className="text-[10px] font-mono text-zinc-400">Full-Bleed Canvas</span>
      </div>

      {/* Upload Custom Race Photo */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-4 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-amber-400/40 hover:border-amber-400 rounded-xl transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-zinc-800 text-zinc-300 group-hover:text-amber-400 group-hover:scale-105 transition-all mb-2">
            <UploadCloud className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
            Upload Your Adventure Photo
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">
            PNG, JPG, HEIC up to 50MB (Hike, Run, Ride, Trek, Expedition)
          </span>
        </button>
      </div>
    </div>
  );
};
