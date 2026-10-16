import React, { useState } from 'react';
import { GpxPhotosLogo } from './GpxPhotosLogo';
import { EventPreset } from '../data/eventCatalog';
import {
  Calendar,
  MapPin,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  ArrowLeft,
  Check,
  Compass,
} from 'lucide-react';

interface EventLandingPageProps {
  event: EventPreset;
  onOpenStudioWithEvent: (event: EventPreset) => void;
  onBackToMainLanding: () => void;
}

export const EventLandingPage: React.FC<EventLandingPageProps> = ({
  event,
  onOpenStudioWithEvent,
  onBackToMainLanding,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* 1. EVENT HEADER */}
      <header className="sticky top-0 z-50 bg-[#0E0E12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMainLanding}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-2"
            title="Back to All Features"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Events</span>
          </button>
          <GpxPhotosLogo variant="horizontal" theme="dark" size={28} />
          <span className="hidden md:inline text-xs text-zinc-500 font-mono">/ {event.shortName}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenStudioWithEvent(event)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-md hover:shadow-amber-400/20 transition-all cursor-pointer"
          >
            <span>Create {event.shortName} Art</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* 2. EVENT HERO SECTION */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Event Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] font-mono text-amber-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Official Event Page · {event.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
            {event.heroHeadline}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {event.description}
          </p>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2">
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Distance</span>
              <span className="text-sm sm:text-base font-bold text-white font-mono">{event.distanceKm} km</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Elevation</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">+{event.elevationGainM} m</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Race Date</span>
              <span className="text-xs sm:text-sm font-semibold text-white font-mono truncate">{event.date.split(',')[0]}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Discipline</span>
              <span className="text-xs sm:text-sm font-semibold text-white font-mono capitalize">{event.discipline}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenStudioWithEvent(event)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xl hover:shadow-amber-400/25 cursor-pointer group"
            >
              <span>Load {event.shortName} Track & Customize</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <a
              href="/ride-joburg-route.gpx"
              download="ride-joburg-official-97km.gpx"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer"
              title="Download official Ride Joburg 97km route GPX file"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Official .GPX</span>
            </a>
          </div>
        </div>

        {/* 3. INTERACTIVE EVENT PREVIEW CARD */}
        <div className="mt-12 sm:mt-16 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] bg-zinc-950">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden">
            <img
              src={event.samplePhotoUrl}
              alt={`${event.name} Finish Artwork Preview`}
              className="w-full h-full object-cover"
            />

            {/* Floating Glass Telemetry Plaque */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 bg-zinc-950/85 backdrop-blur-xl border border-white/20 rounded-xl p-3.5 sm:p-5 shadow-2xl text-left max-w-[260px] sm:max-w-xs pointer-events-none">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[10px] sm:text-xs font-black tracking-wider text-white font-mono uppercase">
                  {event.hudPreset.headerTitle || event.name.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono text-amber-400">{event.hudPreset.headerYear || '2026'}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 text-[10px] sm:text-xs">
                {event.hudPreset.customMetrics?.map((m) => (
                  <div key={m.id}>
                    <span className="text-zinc-400 block text-[9px] uppercase font-mono">{m.label}</span>
                    <span className="font-bold text-white font-mono">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-zinc-950/90 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-xl pointer-events-none">
              <GpxPhotosLogo variant="horizontal" size={20} theme="dark" />
            </div>

            {/* Bottom Floating Bar */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.location}</span>
              </div>
              <button
                onClick={() => onOpenStudioWithEvent(event)}
                className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer shadow flex items-center gap-1.5"
              >
                <span>Customize in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COURSE HIGHLIGHTS */}
      <section className="py-14 border-t border-white/[0.08] bg-[#0E0E12] px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
              Iconic Course Landmarks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              What Makes {event.shortName} Legendary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {event.courseHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 3-STEP RACE ACTION */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
            Quick Finish Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Make Your {event.shortName} Finish Memento
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
            <span className="text-amber-400 font-mono text-xs font-bold">STEP 01</span>
            <h4 className="text-sm font-bold text-white">Upload Your Race Photo</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drop any photo taken on race day (at the finish line, on the course, or with your medal).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
            <span className="text-amber-400 font-mono text-xs font-bold">STEP 02</span>
            <h4 className="text-sm font-bold text-white">Route Auto-Aligns</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The {event.distanceKm} km official circuit is already pre-loaded. Or drop your own recorded .GPX file.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
            <span className="text-amber-400 font-mono text-xs font-bold">STEP 03</span>
            <h4 className="text-sm font-bold text-white">Personalize & Download</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Type your chip time, bib number, and rider name. Export the free social edition or unbranded 4K master.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onOpenStudioWithEvent(event)}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <span>Launch Studio for {event.shortName}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* 6. EVENT FAQS */}
      <section className="py-16 border-t border-white/[0.08] bg-[#0E0E12]/50 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
              {event.shortName} FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {event.faqs.map((f, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-4.5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{f.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0 ml-3" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-zinc-300 leading-relaxed border-t border-white/5 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/10 bg-black/60 py-8 px-4 sm:px-8 text-xs text-zinc-400 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GpxPhotosLogo variant="horizontal" size={24} theme="dark" />
            <span className="text-[11px] text-zinc-400">
              © {new Date().getFullYear()} gpx.photos · {event.name}
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button onClick={onBackToMainLanding} className="hover:text-amber-300 transition-colors cursor-pointer">
              All Events & Tools
            </button>
            <button onClick={() => onOpenStudioWithEvent(event)} className="hover:text-amber-300 transition-colors cursor-pointer">
              Open Studio
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
