import React, { useRef, useState } from 'react';
import {
  ActivityData,
  HudCardConfig,
  PhotoAtmosphereConfig,
} from '../../types/poster';
import { parseGpxString } from '../../utils/gpxParser';
import { V2_SAMPLE_PHOTOS } from '../../data/v2Presets';
import { FEATURED_EVENTS } from '../../data/eventCatalog';
import {
  UploadCloud,
  FileCode,
  Check,
  Sun,
  RotateCcw,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

interface V2PhotoSectionProps {
  currentPhotoUrl: string;
  onSelectPhoto: (url: string) => void;
  activity: ActivityData;
  onUpdateActivity: (updated: Partial<ActivityData>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
  atmosphere: PhotoAtmosphereConfig;
  onUpdateAtmosphere: (updated: Partial<PhotoAtmosphereConfig>) => void;
}

const COLOR_GRADES: { id: PhotoAtmosphereConfig['grade']; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'natural_warm', label: 'Warm Daylight' },
  { id: 'golden_hour', label: 'Golden Hour' },
  { id: 'high_contrast', label: 'Editorial' },
  { id: 'cyber_twilight', label: 'Twilight' },
];

export const V2PhotoSection: React.FC<V2PhotoSectionProps> = ({
  currentPhotoUrl,
  onSelectPhoto,
  activity,
  onUpdateActivity,
  hudCard,
  onUpdateHudCard,
  atmosphere,
  onUpdateAtmosphere,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isUploadingGpx, setIsUploadingGpx] = useState(false);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const [gpxSuccess, setGpxSuccess] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const readPhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) onSelectPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readPhotoFile(file);
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readPhotoFile(file);
  };

  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGpx(true);
    setGpxError(null);
    setGpxSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGpxString(text, activity.athleteName);

        const newDistance = parsed.distanceKm ?? activity.distanceKm;
        const newTime = parsed.durationFormatted ?? activity.durationFormatted;
        const newElevation = parsed.elevationGainM ?? activity.elevationGainM;
        const newSpeed = parsed.avgPaceOrSpeed ?? activity.avgPaceOrSpeed;
        const cleanName = parsed.name || file.name.replace(/\.[^/.]+$/, '');

        onUpdateActivity({
          id: `custom-${Date.now()}`,
          name: cleanName,
          distanceKm: newDistance,
          durationFormatted: newTime,
          avgPaceOrSpeed: newSpeed,
          elevationGainM: newElevation,
          coordinates:
            parsed.coordinates && parsed.coordinates.length > 0
              ? parsed.coordinates
              : activity.coordinates,
          elevationProfile:
            parsed.elevationProfile && parsed.elevationProfile.length > 0
              ? parsed.elevationProfile
              : activity.elevationProfile,
        });

        onUpdateHudCard({
          headerTitle: cleanName.toUpperCase(),
          customMetrics: [
            { id: 'm1', label: 'Distance:', value: `${newDistance} km` },
            { id: 'm2', label: 'Time:', value: newTime },
            { id: 'm3', label: 'Elevation Gain:', value: `${newElevation.toLocaleString()} m` },
            {
              id: 'm4',
              label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
              value: newSpeed,
            },
          ],
        });

        setGpxSuccess(`${cleanName} · ${newDistance} km`);
        setIsUploadingGpx(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse GPX file';
        setGpxError(msg);
        setIsUploadingGpx(false);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleRoute = (eventSlug: string) => {
    const evt = FEATURED_EVENTS.find((item) => item.slug === eventSlug);
    if (!evt) return;
    onUpdateActivity(evt.sampleActivity);
    onUpdateHudCard({
      headerTitle: evt.sampleActivity.name.toUpperCase(),
      customMetrics: evt.hudPreset.customMetrics,
    });
    setGpxError(null);
    setGpxSuccess(`Loaded ${evt.shortName} route`);
  };

  return (
    <div className="space-y-5">
      {/* 1. Photo Source */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Photograph</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">Original ratio preserved</span>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingPhoto(true);
          }}
          onDragLeave={() => setIsDraggingPhoto(false)}
          onDrop={handlePhotoDrop}
          className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed transition-all cursor-pointer text-left group ${
            isDraggingPhoto
              ? 'bg-[#FC5200]/10 border-[#FC5200] text-white'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/15 hover:border-[#FC5200]/60'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800/90 border border-white/10 flex items-center justify-center shrink-0 text-zinc-300 group-hover:text-[#FC5200] transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">
              Upload or Drop Photo
            </span>
            <span className="text-[11px] text-zinc-400 block truncate">
              JPG, PNG, HEIC · Processed locally in browser
            </span>
          </div>
        </button>

        {/* Sample Photos Strip */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
            Try sample scenes
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {V2_SAMPLE_PHOTOS.map((sample) => {
              const isActive = currentPhotoUrl === sample.url;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectPhoto(sample.url)}
                  className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer aspect-[4/3] ${
                    isActive
                      ? 'border-[#FC5200] ring-2 ring-[#FC5200]/30'
                      : 'border-white/10 opacity-75 hover:opacity-100'
                  }`}
                  title={`${sample.label} (${sample.category})`}
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-1 py-0.5">
                    <span className="text-[9px] font-medium text-white block truncate leading-tight">
                      {sample.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. GPX Route File */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Activity Track (.GPX)</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">
            {activity.distanceKm} km
          </span>
        </div>

        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={handleGpxUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => gpxInputRef.current?.click()}
          disabled={isUploadingGpx}
          className="w-full flex items-center gap-3.5 p-3.5 bg-zinc-900/60 hover:bg-zinc-900 border border-dashed border-white/15 hover:border-[#FC5200]/60 rounded-xl transition-all cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800/90 border border-white/10 flex items-center justify-center shrink-0 text-zinc-300 group-hover:text-[#FC5200] transition-colors">
            <FileCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">
              {isUploadingGpx ? 'Reading GPX Track...' : 'Upload GPX File'}
            </span>
            <span className="text-[11px] text-zinc-400 block truncate">
              Strava, Garmin, Apple Watch, COROS, AllTrails
            </span>
          </div>
        </button>

        {gpxError && (
          <p className="p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-lg text-[11px] text-rose-300 font-mono">
            {gpxError}
          </p>
        )}

        {gpxSuccess && (
          <p className="p-2.5 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{gpxSuccess}</span>
          </p>
        )}

        {/* Quick Sample GPX Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500 shrink-0">Sample route:</span>
          {FEATURED_EVENTS.map((evt) => (
            <button
              key={evt.slug}
              type="button"
              onClick={() => loadSampleRoute(evt.slug)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer truncate ${
                activity.id.includes(evt.slug)
                  ? 'bg-zinc-800 border-[#FC5200]/60 text-white'
                  : 'bg-zinc-900/60 border-white/[0.07] text-zinc-400 hover:text-white'
              }`}
            >
              {evt.shortName}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Photo Color & Tone */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Tone &amp; Grading</span>
          </h3>
          <button
            type="button"
            onClick={() =>
              onUpdateAtmosphere({
                grade: 'original',
                brightness: 1.0,
                contrast: 1.0,
                warmth: 0,
              })
            }
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COLOR_GRADES.map((grade) => {
            const active = atmosphere.grade === grade.id;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => onUpdateAtmosphere({ grade: grade.id })}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  active
                    ? 'bg-zinc-800 border-[#FC5200] text-white'
                    : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {grade.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Fine Light Adjustments */}
        <div className="rounded-xl border border-white/[0.07] bg-zinc-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdjustments((prev) => !prev)}
            className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Light &amp; Contrast Adjustments</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                showAdjustments ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdjustments && (
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-white/[0.06]">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Brightness</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(atmosphere.brightness * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.02"
                  value={atmosphere.brightness}
                  onChange={(e) =>
                    onUpdateAtmosphere({ brightness: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Contrast</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(atmosphere.contrast * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.02"
                  value={atmosphere.contrast}
                  onChange={(e) =>
                    onUpdateAtmosphere({ contrast: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400">Warmth</span>
                  <span className="font-mono text-zinc-200">
                    {atmosphere.warmth > 0 ? `+${atmosphere.warmth}` : atmosphere.warmth}
                  </span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="40"
                  step="1"
                  value={atmosphere.warmth}
                  onChange={(e) =>
                    onUpdateAtmosphere({ warmth: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#FC5200] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
