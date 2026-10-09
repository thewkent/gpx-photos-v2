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
  onAutoStyle?: () => void;
  isAutoStyling?: boolean;
  autoStyleSummary?: {
    mood: string;
    paletteDescription: string;
    routeColorName: string;
    accentHex: string;
    source: string;
  } | null;
}

export const PhotoTab: React.FC<PhotoTabProps> = ({
  currentPhotoUrl,
  onSelectPhoto,
  atmosphere,
  onUpdateAtmosphere,
  onApplyPresetAlignment,
  onAutoStyle,
  isAutoStyling,
  autoStyleSummary,
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
      label: 'Pro Road Cyclist',
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

        {/* Curated Pro Photos */}
        <div>
          <span className="text-[11px] font-medium text-zinc-400 block mb-2">
            Or choose a reference race scene:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {curatedPhotos.map((photo) => {
              const isSelected = currentPhotoUrl === photo.url;
              return (
                <button
                  key={photo.url}
                  onClick={() => {
                    onSelectPhoto(photo.url);
                    if (onApplyPresetAlignment) {
                      onApplyPresetAlignment(photo.spatialPreset, photo.hudPreset);
                    }
                  }}
                  className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all text-left ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-semibold text-white leading-tight truncate">
                      {photo.sport}
                    </span>
                    <span className="text-[9px] text-zinc-300 font-mono truncate">
                      {photo.label.split(' ')[0]}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAGIC AUTO-STYLE ACCELERATOR */}
      <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-zinc-900/90 to-zinc-950 border border-amber-500/30 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Magic Auto-Style
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Analyzes photo palette, tarmac lighting, and negative space to auto-coordinate atmosphere, 3D laser route, and HUD contrast.
            </p>
          </div>
          {onAutoStyle && (
            <button
              onClick={onAutoStyle}
              disabled={isAutoStyling}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-md hover:shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAutoStyling ? 'animate-spin' : ''}`} />
              <span>{isAutoStyling ? 'Analyzing...' : 'Auto-Style'}</span>
            </button>
          )}
        </div>

        {autoStyleSummary && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 truncate text-amber-300">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                style={{ backgroundColor: autoStyleSummary.accentHex }}
              />
              <span className="truncate">
                {autoStyleSummary.mood} • {autoStyleSummary.routeColorName}
              </span>
            </div>
            <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider shrink-0 ml-2 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Applied
            </span>
          </div>
        )}
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
