import React, { useRef } from 'react';
import { ASSETS } from '../data/sampleRoutes';
import { SpatialRouteConfig, HudCardConfig, PhotoAtmosphereConfig } from '../types/poster';
import { UploadCloud, Check, Sun, Sparkles, Sliders, RotateCcw } from 'lucide-react';

interface PhotoTabProps {
  currentPhotoUrl: string;
  onSelectPhoto: (url: string) => void;
  atmosphere: PhotoAtmosphereConfig;
  onUpdateAtmosphere: (updated: Partial<PhotoAtmosphereConfig>) => void;
  onApplyPresetAlignment?: (spatial: Partial<SpatialRouteConfig>, hud: Partial<HudCardConfig>) => void;
}

export const PhotoTab: React.FC<PhotoTabProps> = ({
  currentPhotoUrl,
  onSelectPhoto,
  atmosphere,
  onUpdateAtmosphere,
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

  const colorGrades = [
    { id: 'original', label: 'Original (Natural Daylight)' },
    { id: 'golden_hour', label: 'Golden Hour Warmth' },
    { id: 'natural_warm', label: 'Warm Sunlight' },
    { id: 'high_contrast', label: 'High-Contrast Editorial' },
    { id: 'cyber_twilight', label: 'Cyber Twilight' },
  ] as const;

  const resetAtmosphere = () => {
    onUpdateAtmosphere({
      grade: 'original',
      brightness: 1.0,
      contrast: 1.0,
      warmth: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. PHOTO SOURCE & UPLOAD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Athlete Photo
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">100% Uncropped</span>
        </div>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-4 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-zinc-800 text-zinc-300 group-hover:text-amber-400 group-hover:scale-105 transition-all mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-white group-hover:text-amber-300 transition-colors">
            Upload Personal Race Photo
          </span>
          <span className="text-[10px] text-zinc-500 mt-0.5">
            PNG, JPG, HEIC up to 50MB (Retains 100% Original Ratio)
          </span>
        </button>
      </div>

      {/* 2. PHOTO ENHANCEMENTS & COLOR GRADING */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Color Grading & Atmosphere
            </h3>
          </div>
          <button
            onClick={resetAtmosphere}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            title="Reset to default enhancements"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Grade Presets */}
        <div className="grid grid-cols-2 gap-2">
          {colorGrades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => onUpdateAtmosphere({ grade: grade.id })}
              className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                atmosphere.grade === grade.id
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-sm'
                  : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>

        {/* Sliders: Brightness, Contrast, Warmth */}
        <div className="p-3.5 bg-zinc-900/70 border border-white/[0.08] rounded-xl space-y-3.5">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300">Brightness</span>
              <span className="font-mono text-amber-400">{Math.round(atmosphere.brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.02"
              value={atmosphere.brightness}
              onChange={(e) => onUpdateAtmosphere({ brightness: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300">Contrast</span>
              <span className="font-mono text-amber-400">{Math.round(atmosphere.contrast * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.02"
              value={atmosphere.contrast}
              onChange={(e) => onUpdateAtmosphere({ contrast: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Warmth */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300">Warmth Tint</span>
              <span className="font-mono text-amber-400">
                {atmosphere.warmth > 0 ? `+${atmosphere.warmth}` : atmosphere.warmth}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="40"
              step="1"
              value={atmosphere.warmth}
              onChange={(e) => onUpdateAtmosphere({ warmth: parseInt(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>Cool / Neutral</span>
              <span>Golden Sunset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
