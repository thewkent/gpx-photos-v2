import React, { useRef, useState } from 'react';
import { SAMPLE_ACTIVITIES } from '../data/sampleRoutes';
import { StravaActivityData } from '../types/poster';
import { parseGpxString } from '../utils/gpxParser';
import { Upload, MapPin, Activity, Flame, Edit3, Check } from 'lucide-react';

interface RouteSelectorProps {
  currentActivity: StravaActivityData;
  onSelectActivity: (activity: StravaActivityData) => void;
  onUpdateActivity: (updated: Partial<StravaActivityData>) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  currentActivity,
  onSelectActivity,
  onUpdateActivity,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGpx, setIsUploadingGpx] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditingStats, setIsEditingStats] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGpx(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGpxString(text, currentActivity.athleteName);

        const newActivity: StravaActivityData = {
          ...currentActivity,
          id: `custom-${Date.now()}`,
          name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
          distanceKm: parsed.distanceKm || 21.1,
          durationFormatted: parsed.durationFormatted || currentActivity.durationFormatted,
          avgPaceOrSpeed: parsed.avgPaceOrSpeed || currentActivity.avgPaceOrSpeed,
          elevationGainM: parsed.elevationGainM || 250,
          coordinates: parsed.coordinates && parsed.coordinates.length > 0 ? parsed.coordinates : currentActivity.coordinates,
          elevationProfile: parsed.elevationProfile && parsed.elevationProfile.length > 0 ? parsed.elevationProfile : currentActivity.elevationProfile,
        };

        onSelectActivity(newActivity);
        setIsUploadingGpx(false);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to parse GPX file';
        setUploadError(errorMsg);
        setIsUploadingGpx(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Error reading file from disk.');
      setIsUploadingGpx(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Tab */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Telemetry & Route
        </h3>
        <button
          onClick={() => setIsEditingStats(!isEditingStats)}
          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>{isEditingStats ? 'Close Editor' : 'Edit Telemetry'}</span>
        </button>
      </div>

      {/* GPX File Drop Zone */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingGpx}
          className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-dashed border-white/15 hover:border-amber-400/50 rounded-xl text-xs font-medium text-zinc-300 transition-all group"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
          <span>{isUploadingGpx ? 'Parsing GPX Track...' : 'Upload Personal GPX Track'}</span>
        </button>
        {uploadError && (
          <p className="mt-1 text-[11px] text-rose-400">{uploadError}</p>
        )}
      </div>

      {/* Manual Telemetry Form */}
      {isEditingStats && (
        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={currentActivity.name}
                onChange={(e) => onUpdateActivity({ name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={currentActivity.location}
                onChange={(e) => onUpdateActivity({ location: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentActivity.distanceKm}
                onChange={(e) => onUpdateActivity({ distanceKm: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Chip Time
              </label>
              <input
                type="text"
                value={currentActivity.durationFormatted}
                onChange={(e) => onUpdateActivity({ durationFormatted: e.target.value })}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Avg Pace
              </label>
              <input
                type="text"
                value={currentActivity.avgPaceOrSpeed}
                onChange={(e) => onUpdateActivity({ avgPaceOrSpeed: e.target.value })}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Elevation Gain (m)
              </label>
              <input
                type="number"
                value={currentActivity.elevationGainM}
                onChange={(e) => onUpdateActivity({ elevationGainM: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="text"
                value={currentActivity.date}
                onChange={(e) => onUpdateActivity({ date: e.target.value })}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Personal Dedication / Motto
            </label>
            <input
              type="text"
              value={currentActivity.customQuote}
              onChange={(e) => onUpdateActivity({ customQuote: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
