import React, { useRef, useState } from 'react';
import { ASSETS, SAMPLE_ACTIVITIES } from '../data/sampleRoutes';
import { ActivityData, SpatialRouteConfig, HudCardConfig, PhotoAtmosphereConfig } from '../types/poster';
import { parseGpxString } from '../utils/gpxParser';
import { GpxPhotosLogo } from './GpxPhotosLogo';
import {
  UploadCloud,
  Check,
  Sun,
  Sparkles,
  Sliders,
  RotateCcw,
  Compass,
  FileCode,
  ArrowRight,
  Calendar,
  Tag,
  User,
  Activity as ActivityIcon,
} from 'lucide-react';

interface UploadTabProps {
  currentPhotoUrl: string;
  onSelectPhoto: (url: string) => void;
  activity: ActivityData;
  onUpdateActivity: (updated: Partial<ActivityData>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
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
  onContinueToOverlay?: () => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  currentPhotoUrl,
  onSelectPhoto,
  activity,
  onUpdateActivity,
  hudCard,
  onUpdateHudCard,
  atmosphere,
  onUpdateAtmosphere,
  onApplyPresetAlignment,
  onAutoStyle,
  isAutoStyling,
  autoStyleSummary,
  onContinueToOverlay,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGpx, setIsUploadingGpx] = useState(false);
  const [gpxUploadError, setGpxUploadError] = useState<string | null>(null);
  const [gpxUploadSuccess, setGpxUploadSuccess] = useState<string | null>(null);

  // Photo file upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onSelectPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // GPX file upload handler
  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGpx(true);
    setGpxUploadError(null);
    setGpxUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGpxString(text, activity.athleteName);

        const newDistance = parsed.distanceKm || activity.distanceKm;
        const newTime = parsed.durationFormatted || activity.durationFormatted;
        const newElevation = parsed.elevationGainM || activity.elevationGainM;
        const newSpeed = parsed.avgPaceOrSpeed || activity.avgPaceOrSpeed;
        const cleanName = parsed.name || file.name.replace(/\.[^/.]+$/, '');

        onUpdateActivity({
          id: `custom-${Date.now()}`,
          name: cleanName,
          distanceKm: newDistance,
          durationFormatted: newTime,
          avgPaceOrSpeed: newSpeed,
          elevationGainM: newElevation,
          coordinates: parsed.coordinates && parsed.coordinates.length > 0 ? parsed.coordinates : activity.coordinates,
          elevationProfile: parsed.elevationProfile && parsed.elevationProfile.length > 0 ? parsed.elevationProfile : activity.elevationProfile,
        });

        // Sync HUD Card metrics & event title
        onUpdateHudCard({
          headerTitle: cleanName.toUpperCase(),
          customMetrics: [
            { id: 'm1', label: 'Distance:', value: `${newDistance} km` },
            { id: 'm2', label: 'Time:', value: newTime },
            { id: 'm3', label: 'Elevation Gain:', value: `${newElevation.toLocaleString()} m` },
            { id: 'm4', label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:', value: newSpeed },
          ],
        });

        setGpxUploadSuccess(`Loaded: ${cleanName} (${newDistance} km)`);
        setIsUploadingGpx(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse GPX file';
        setGpxUploadError(msg);
        setIsUploadingGpx(false);
      }
    };
    reader.readAsText(file);
  };

  const curatedPhotos = [
    {
      label: 'Road Cycling (Ride Joburg)',
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
      label: 'Marathon Road Running',
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
      sport: 'Hiking / Trek',
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

  return (
    <div className="space-y-6">
      {/* Brand Studio Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <GpxPhotosLogo variant="emblem" size={26} />
          <div>
            <span className="text-xs font-bold text-white block leading-tight">
              Create 3D Route Art
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              gpx.photos Studio
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
          Step 1 of 2
        </span>
      </div>

      {/* ======================================================== */}
      {/* 1. STEP 1: ADVENTURE PHOTO                                */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center font-mono">
              1
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Activity & Adventure Photo
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">100% Uncropped</span>
        </div>

        {/* Upload Photo Button */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        <button
          onClick={() => photoInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-4 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-zinc-800 text-zinc-300 group-hover:text-amber-400 group-hover:scale-105 transition-all mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
            Upload Your Adventure Photo
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">
            PNG, JPG, HEIC up to 50MB (Hike, Run, Ride, Trek, Expedition)
          </span>
        </button>

        {/* Reference Photos */}
        <div>
          <span className="text-[11px] font-medium text-zinc-400 block mb-2">
            Or choose a reference adventure:
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
                  className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all text-left cursor-pointer ${
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

      {/* ======================================================== */}
      {/* 2. STEP 2: GPX ROUTE & ACTIVITY UPLOAD                   */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center font-mono">
              2
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              GPX Activity Track
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">.GPX file</span>
        </div>

        {/* Upload GPX Button */}
        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={handleGpxUpload}
          className="hidden"
        />

        <button
          onClick={() => gpxInputRef.current?.click()}
          disabled={isUploadingGpx}
          className="w-full flex flex-col items-center justify-center p-4 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-zinc-800 text-zinc-300 group-hover:text-amber-400 group-hover:scale-105 transition-all mb-2">
            <FileCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
            {isUploadingGpx ? 'Parsing GPX Track...' : 'Upload GPX Route File'}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">
            From Garmin, Apple Watch, AllTrails, Komoot, Wahoo, COROS, or GPS handheld
          </span>
        </button>

        {gpxUploadError && (
          <p className="p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-mono">
            {gpxUploadError}
          </p>
        )}

        {gpxUploadSuccess && (
          <p className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-mono flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{gpxUploadSuccess}</span>
          </p>
        )}

        {/* Current Loaded Route Telemetry Summary Badge */}
        <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white truncate max-w-[200px]">
              {activity.name}
            </span>
            <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {activity.sport}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/5 text-center">
            <div className="p-1.5 bg-zinc-950/60 rounded border border-white/5">
              <span className="text-[9px] text-zinc-500 block uppercase font-mono">Dist</span>
              <span className="text-xs font-bold text-white font-mono">{activity.distanceKm} km</span>
            </div>
            <div className="p-1.5 bg-zinc-950/60 rounded border border-white/5">
              <span className="text-[9px] text-zinc-500 block uppercase font-mono">Time</span>
              <span className="text-xs font-bold text-white font-mono">{activity.durationFormatted}</span>
            </div>
            <div className="p-1.5 bg-zinc-950/60 rounded border border-white/5">
              <span className="text-[9px] text-zinc-500 block uppercase font-mono">Elev</span>
              <span className="text-xs font-bold text-white font-mono">+{activity.elevationGainM}m</span>
            </div>
            <div className="p-1.5 bg-zinc-950/60 rounded border border-white/5">
              <span className="text-[9px] text-zinc-500 block uppercase font-mono">Pace/Spd</span>
              <span className="text-xs font-bold text-white font-mono">{activity.avgPaceOrSpeed.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STEP 3: TITLE & YEAR (CUSTOMIZABLE FOR ANY ADVENTURE) */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center font-mono">
              3
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Activity / Event Title & Year
            </h3>
          </div>
          <span className="text-[11px] text-amber-400 font-mono">Custom Header</span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Personalize the header title on your telemetry plaque (e.g. Mount Whitney Summit, Cape Epic, Tour du Mont Blanc, Berlin Marathon, or Sunday Gravel Ride).
        </p>

        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>Activity / Route Title</span>
              </label>
              <input
                type="text"
                value={hudCard.headerTitle ?? activity.name}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateHudCard({ headerTitle: val });
                  onUpdateActivity({ name: val });
                }}
                placeholder="e.g. MOUNT WHITNEY SUMMIT"
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Year</span>
              </label>
              <input
                type="text"
                value={hudCard.headerYear ?? '2026'}
                onChange={(e) => onUpdateHudCard({ headerYear: e.target.value })}
                placeholder="2026"
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-amber-400" />
              <span>Adventurer / Participant Name</span>
            </label>
            <input
              type="text"
              value={activity.athleteName}
              onChange={(e) => onUpdateActivity({ athleteName: e.target.value })}
              placeholder="e.g. Alex Honnold"
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAGIC AUTO-STYLE ACCELERATOR                          */}
      {/* ======================================================== */}
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
              Analyzes subject position, open sky/negative space, and photo lighting to auto-position the 3D route, telemetry plaque, and elevation profile.
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

      {/* ======================================================== */}
      {/* 5. PHOTO ENHANCEMENTS & COLOR GRADING                     */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Color Grading & Atmosphere
            </h3>
          </div>
          <button
            onClick={() =>
              onUpdateAtmosphere({
                grade: 'original',
                brightness: 1.0,
                contrast: 1.0,
                warmth: 0,
              })
            }
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Color Grades Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {colorGrades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => onUpdateAtmosphere({ grade: grade.id })}
              className={`p-2 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                atmosphere.grade === grade.id
                  ? 'bg-zinc-800 border-amber-400 text-white'
                  : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>

      {/* Continue to GPX Overlay CTA */}
      {onContinueToOverlay && (
        <div className="pt-2">
          <button
            onClick={onContinueToOverlay}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-850 hover:bg-zinc-800 border border-white/10 hover:border-amber-400/40 rounded-xl text-xs font-semibold text-amber-300 transition-all cursor-pointer group shadow-sm"
          >
            <span>Customize 3D GPX Overlay Settings</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
