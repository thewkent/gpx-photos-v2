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

  const curatedPhotos = [
    {
      label: 'RideJoburg Bridge (Reference)',
      url: ASSETS.rideJoburgCyclist,
      sport: 'Cycling',
      spatialPreset: {
        tiltAngle: 0,
        yawAngle: 0,
        scale: 1.0,
        posX: 0.60,
        posY: 0.65,
        glowColor: '#FC5200',
      },
      hudPreset: {
        posX: 0.16,
        posY: 0.70,
        tiltY: 0,
        tiltX: 0,
      },
    },
    {
      label: 'Marathon Open Highway',
      url: ASSETS.roadMarathoner,
      sport: 'Running',
      spatialPreset: {
        tiltAngle: 0,
        yawAngle: 0,
        scale: 0.95,
        posX: 0.5,
        posY: 0.65,
        glowColor: '#FC5200',
      },
      hudPreset: {
        posX: 0.16,
        posY: 0.70,
        tiltY: 0,
        tiltX: 0,
      },
    },
    {
      label: 'Alpine Ridge Summit',
      url: ASSETS.trailSummit,
      sport: 'Trail Ultra',
      spatialPreset: {
        tiltAngle: 0,
        yawAngle: 0,
        scale: 0.85,
        posX: 0.55,
        posY: 0.65,
        glowColor: '#0284C7',
      },
      hudPreset: {
        posX: 0.16,
        posY: 0.70,
        tiltY: 0,
        tiltX: 0,
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
          Athlete Photography
        </h3>
        <span className="text-[10px] font-mono text-zinc-400">Full-Bleed Canvas</span>
      </div>

      {/* Preset Curated Photos */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono uppercase text-zinc-400">
          Curated Ground Perspective Scenes
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {curatedPhotos.map((preset) => {
            const isSelected = currentPhotoUrl === preset.url;

            return (
              <button
                key={preset.label}
                onClick={() => {
                  onSelectPhoto(preset.url);
                  if (onApplyPresetAlignment) {
                    onApplyPresetAlignment(preset.spatialPreset, preset.hudPreset);
                  }
                }}
                className={`group flex items-center gap-3 p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-zinc-900/60 border-white/[0.06] hover:bg-zinc-850 hover:border-white/15'
                }`}
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                  <img
                    src={preset.url}
                    alt={preset.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-200 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {preset.sport} · Auto-aligns 3D ground plane
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Custom Race Photo */}
      <div className="pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900/80 hover:bg-zinc-850 border border-dashed border-amber-400/40 hover:border-amber-400 rounded-xl text-xs font-medium text-amber-200 transition-all group"
        >
          <UploadCloud className="w-4 h-4 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
          <span>Upload Your Race / Training Photo</span>
        </button>
        <p className="text-[10px] text-zinc-400 text-center mt-1.5">
          Tip: Photos with road, tarmac, or trail in the foreground look the most realistic for 3D laser projection!
        </p>
      </div>
    </div>
  );
};
