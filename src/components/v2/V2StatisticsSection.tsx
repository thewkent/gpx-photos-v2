import React, { useState } from 'react';
import {
  ActivityData,
  HudCardConfig,
  HudCustomMetric,
} from '../../types/poster';
import {
  OUTDOOR_ACTIVITY_OPTIONS,
  OutdoorActivityOption,
} from '../../data/v2Presets';
import {
  Activity,
  ArrowRightLeft,
  Edit3,
  Tag,
  Check,
} from 'lucide-react';

interface V2StatisticsSectionProps {
  activity: ActivityData;
  onUpdateActivity: (updated: Partial<ActivityData>) => void;
  hudCard: HudCardConfig;
  onUpdateHudCard: (updated: Partial<HudCardConfig>) => void;
}

export const V2StatisticsSection: React.FC<V2StatisticsSectionProps> = ({
  activity,
  onUpdateActivity,
  hudCard,
  onUpdateHudCard,
}) => {
  const [selectedActivityLabel, setSelectedActivityLabel] = useState<string>(
    () => {
      if (activity.sport === 'cycling') return 'cycling';
      if (activity.sport === 'trail') return 'trail_running';
      if (activity.sport === 'hiking') return 'hiking';
      return 'running';
    }
  );
  const [isEditingValues, setIsEditingValues] = useState(false);

  const isCurrentlyImperial =
    hudCard.customMetrics?.some(
      (m) =>
        m.value.includes('mi') ||
        m.value.includes('ft') ||
        m.value.includes('mph')
    ) ||
    activity.avgPaceOrSpeed.includes('mph') ||
    activity.avgPaceOrSpeed.includes('/mi');

  const currentMetrics: HudCustomMetric[] =
    hudCard.customMetrics && hudCard.customMetrics.length === 4
      ? hudCard.customMetrics
      : [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          {
            id: 'm3',
            label: 'Elevation Gain:',
            value: `${activity.elevationGainM.toLocaleString()} m`,
          },
          {
            id: 'm4',
            label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
            value: activity.avgPaceOrSpeed,
          },
        ];

  const handleSelectOutdoorActivity = (option: OutdoorActivityOption) => {
    setSelectedActivityLabel(option.id);
    onUpdateActivity({ sport: option.sportType });

    const updated = [...currentMetrics];
    if (option.id === 'hiking') {
      const peakM =
        activity.elevationProfile && activity.elevationProfile.length > 0
          ? Math.max(...activity.elevationProfile.map((p) => p.elevationM))
          : null;
      if (peakM !== null) {
        const displayPeak = isCurrentlyImperial
          ? `${Math.round(peakM * 3.28084).toLocaleString()} ft`
          : `${peakM.toLocaleString()} m`;
        updated[3] = {
          id: 'm4',
          label: 'Peak Altitude:',
          value: displayPeak,
        };
      } else {
        updated[3] = {
          id: 'm4',
          label: 'Ave Pace:',
          value: activity.avgPaceOrSpeed,
        };
      }
    } else {
      updated[3] = {
        id: 'm4',
        label: option.rateLabel,
        value: activity.avgPaceOrSpeed,
      };
    }

    onUpdateHudCard({ customMetrics: updated });
  };

  const toggleUnitSystem = () => {
    if (!isCurrentlyImperial) {
      const mi = (activity.distanceKm * 0.621371).toFixed(2);
      const ft = Math.round(activity.elevationGainM * 3.28084).toLocaleString();
      const rawVal = parseFloat(activity.avgPaceOrSpeed);
      const isCycling =
        selectedActivityLabel === 'cycling' ||
        selectedActivityLabel === 'gravel' ||
        selectedActivityLabel === 'mtb' ||
        activity.sport === 'cycling';
      const convertedRate =
        isCycling && Number.isFinite(rawVal)
          ? `${(rawVal * 0.621371).toFixed(1)} mph`
          : activity.avgPaceOrSpeed.includes('/km')
          ? activity.avgPaceOrSpeed.replace('/km', '/mi')
          : activity.avgPaceOrSpeed;

      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${mi} mi` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          { id: 'm3', label: 'Elevation Gain:', value: `${ft} ft` },
          {
            id: 'm4',
            label: isCycling ? 'Ave Speed:' : 'Ave Pace:',
            value: convertedRate,
          },
        ],
      });
      onUpdateActivity({ avgPaceOrSpeed: convertedRate });
    } else {
      const rawVal = parseFloat(activity.avgPaceOrSpeed);
      const isCycling =
        selectedActivityLabel === 'cycling' ||
        selectedActivityLabel === 'gravel' ||
        selectedActivityLabel === 'mtb' ||
        activity.sport === 'cycling';
      const convertedRate =
        isCycling && Number.isFinite(rawVal)
          ? `${(rawVal / 0.621371).toFixed(1)} km/h`
          : activity.avgPaceOrSpeed.includes('/mi')
          ? activity.avgPaceOrSpeed.replace('/mi', '/km')
          : activity.avgPaceOrSpeed;

      onUpdateHudCard({
        customMetrics: [
          { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
          { id: 'm2', label: 'Time:', value: activity.durationFormatted },
          {
            id: 'm3',
            label: 'Elevation Gain:',
            value: `${activity.elevationGainM.toLocaleString()} m`,
          },
          {
            id: 'm4',
            label: isCycling ? 'Ave Speed:' : 'Ave Pace:',
            value: convertedRate,
          },
        ],
      });
      onUpdateActivity({ avgPaceOrSpeed: convertedRate });
    }
  };

  const toggleMetricVisibility = (index: number) => {
    const row = currentMetrics[index];
    const isHidden = !row.label && !row.value;
    const defaults: HudCustomMetric[] = [
      { id: 'm1', label: 'Distance:', value: `${activity.distanceKm} km` },
      { id: 'm2', label: 'Time:', value: activity.durationFormatted },
      {
        id: 'm3',
        label: 'Elevation Gain:',
        value: `${activity.elevationGainM.toLocaleString()} m`,
      },
      {
        id: 'm4',
        label: activity.sport === 'cycling' ? 'Ave Speed:' : 'Ave Pace:',
        value: activity.avgPaceOrSpeed,
      },
    ];

    const updated = [...currentMetrics];
    if (isHidden) {
      updated[index] = defaults[index];
    } else {
      updated[index] = { id: row.id || `m${index + 1}`, label: '', value: '' };
    }
    onUpdateHudCard({ customMetrics: updated });
  };

  const updateMetricRow = (
    index: number,
    field: 'label' | 'value',
    text: string
  ) => {
    const updated = [...currentMetrics];
    updated[index] = { ...updated[index], [field]: text };
    onUpdateHudCard({ customMetrics: updated });
  };

  return (
    <div className="space-y-5">
      {/* 1. Activity Title */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#FC5200]" />
            <span>Activity Title</span>
          </h3>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[11px] text-zinc-400">Show header</span>
            <input
              type="checkbox"
              checked={
                hudCard.showHeader !== false && hudCard.showStravaLogo !== false
              }
              onChange={(e) =>
                onUpdateHudCard({
                  showHeader: e.target.checked,
                  showStravaLogo: e.target.checked,
                })
              }
              className="accent-[#FC5200] rounded cursor-pointer"
            />
          </label>
        </div>

        <input
          type="text"
          value={hudCard.headerTitle ?? activity.name}
          onChange={(e) => {
            const val = e.target.value;
            onUpdateHudCard({ headerTitle: val });
            onUpdateActivity({ name: val });
          }}
          placeholder="e.g. ALPINE RIDGE SUMMIT"
          className="w-full px-3 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-xs text-white uppercase font-semibold tracking-wide focus:outline-none focus:border-[#FC5200]"
        />
      </section>

      {/* 2. Outdoor Activity Selector */}
      <section className="space-y-2.5 pt-4 border-t border-white/[0.08]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#FC5200]" />
          <span>Activity Type</span>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {OUTDOOR_ACTIVITY_OPTIONS.map((opt) => {
            const active = selectedActivityLabel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOutdoorActivity(opt)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  active
                    ? 'bg-zinc-800 border-[#FC5200] text-white'
                    : 'bg-zinc-900/50 border-white/[0.07] text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Displayed Metrics & Units */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            Displayed Metrics
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleUnitSystem}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-200 cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3 text-[#FC5200]" />
              <span>{isCurrentlyImperial ? 'Imperial (mi)' : 'Metric (km)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingValues((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-medium text-amber-300 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingValues ? 'Done' : 'Edit'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {currentMetrics.map((metric, idx) => {
            const isVisible = Boolean(metric.label || metric.value);
            return (
              <div
                key={metric.id || idx}
                className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.07] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMetricVisibility(idx)}
                    className="flex items-center gap-2 text-left cursor-pointer min-w-0"
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        isVisible
                          ? 'bg-[#FC5200] border-[#FC5200] text-white'
                          : 'bg-zinc-950 border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span className="text-xs text-zinc-200 truncate">
                      {isVisible
                        ? metric.label.replace(/:$/, '')
                        : `Hidden Metric ${idx + 1}`}
                    </span>
                  </button>

                  {isVisible && !isEditingValues && (
                    <span className="font-mono text-xs font-semibold text-white shrink-0">
                      {metric.value}
                    </span>
                  )}
                </div>

                {isVisible && isEditingValues && (
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) =>
                        updateMetricRow(idx, 'label', e.target.value)
                      }
                      className="col-span-2 px-2 py-1 bg-zinc-950 border border-white/10 rounded text-[11px] text-zinc-300 focus:outline-none focus:border-[#FC5200]"
                      placeholder="Label:"
                    />
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) =>
                        updateMetricRow(idx, 'value', e.target.value)
                      }
                      className="col-span-3 px-2 py-1 bg-zinc-950 border border-white/10 rounded text-[11px] font-mono font-bold text-white focus:outline-none focus:border-[#FC5200]"
                      placeholder="Value"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
