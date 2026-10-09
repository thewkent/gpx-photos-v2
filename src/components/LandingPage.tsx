import React, { useState } from 'react';
import { GpxPhotosLogo } from './GpxPhotosLogo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Compass,
  TrendingUp,
  Download,
  Share2,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  FileCode,
  Sliders,
  Check,
  Eye,
} from 'lucide-react';
import { ASSETS } from '../data/sampleRoutes';

interface LandingPageProps {
  onOpenStudio: () => void;
  onSelectSampleAndOpen?: (photoUrl: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does gpx.photos work?',
      a: 'Upload your adventure photo (JPEG, PNG, HEIC) and your GPS activity file (.GPX from Garmin, Strava, Apple Watch, AllTrails, Wahoo, or COROS). Our in-browser 3D engine projects your true GPS coordinates onto the ground perspective of your photo with custom laser routes, floating smoked glass HUD plaques, and synchronized elevation profiles.',
    },
    {
      q: 'Are my private race photos or GPS coordinates uploaded to any server?',
      a: 'Never. 100% of the image processing, GPX parsing, and high-resolution rendering happens locally in your browser memory via native HTML5 Canvas 2D and 3D matrix math. Zero bytes of your photos or activity files are ever transmitted to or stored on external servers.',
    },
    {
      q: 'How do I export my GPX file from Strava or Garmin?',
      a: 'On Strava Web, open any activity, click the three dots (…) and choose "Export GPX". On Garmin Connect, click the gear icon and select "Export to GPX". You can also export .gpx files directly from Apple Health, Wahoo, COROS, Komoot, and AllTrails.',
    },
    {
      q: 'What is the difference between the Free and $10 editions?',
      a: 'The Free Social Edition ($0) is free forever and includes the gpx.photos hallmark logo badge (which you can position in any corner). The $10 Clean Master Edition completely removes all watermarks and delivers an unbranded, gallery-grade 300 DPI master download (up to 3840px wide).',
    },
    {
      q: 'Can I choose which corner the logo appears in?',
      a: 'Yes! In the GPX Overlay settings, you can choose Top Left, Top Right, Bottom Left, or Bottom Right to ensure the logo never obscures runners, bikes, or scenic landmarks.',
    },
    {
      q: 'Will my photo be cropped to standard poster ratios?',
      a: 'No. gpx.photos features zero-crop native aspect ratio support. Whatever ratio your camera captured (4:3, 3:2, 16:9, or smartphone vertical), the artwork canvas adapts to fit 100% of your original uncropped photo.',
    },
  ];

  const devices = [
    { name: 'Garmin', desc: 'Forerunner & Edge' },
    { name: 'Strava', desc: 'Any activity' },
    { name: 'Apple Watch', desc: 'Workouts & Health' },
    { name: 'COROS', desc: 'PACE & APEX' },
    { name: 'Wahoo', desc: 'ELEMNT & ROAM' },
    { name: 'AllTrails', desc: 'Hikes & Summits' },
    { name: 'Komoot', desc: 'Tours & Gravel' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* 1. STICKY MARKETING HEADER */}
      <header className="sticky top-0 z-50 bg-[#0E0E12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GpxPhotosLogo variant="horizontal" theme="dark" size={32} />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#showcase" className="hover:text-white transition-colors">
            Gallery
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-md hover:shadow-amber-400/20 transition-all cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Glow ambient backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] font-mono text-amber-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Turn your GPS tracks into 3D activity finish art</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Your Adventure Photos.{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">
              With 3D Route Telemetry.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Overlay true GPS tracks from <strong>Garmin, Strava, or Apple Watch</strong> onto your photos.
            Featuring 3D perspective laser routes, floating smoked glass HUD plaques, and synced elevation profiles.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onOpenStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xl hover:shadow-amber-400/25 cursor-pointer group"
            >
              <span>Create Your 3D Route Art Free</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <a
              href="#showcase"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-400" />
              <span>See Live Showcase</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% In-Browser & Private
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Zero Cloud Uploads
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Free Social Edition ($0)
            </span>
          </div>
        </div>

        {/* 3. HERO SHOWCASE CARD (Sydney Marathon Example) */}
        <div id="showcase" className="mt-14 sm:mt-18 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] bg-zinc-950">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden group">
            <img
              src={ASSETS.sydneyMarathon}
              alt="Sydney Marathon 3D Route Telemetry Art"
              className="w-full h-full object-cover"
            />

            {/* Simulated 3D Neon Laser Overlay Graphic */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(255,85,0,0.8)]"
              viewBox="0 0 1000 650"
              fill="none"
            >
              {/* Route shadow on tarmac */}
              <path
                d="M 280 120 Q 340 240 370 290 T 360 360 T 310 410 T 260 480 T 420 540 T 680 470 T 560 340 T 450 180"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* 3D Glowing Neon Route */}
              <path
                d="M 280 115 Q 340 235 370 285 T 360 355 T 310 405 T 260 475 T 420 535 T 680 465 T 560 335 T 450 175"
                stroke="#FC5200"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Simulated Floating Glass HUD Plaque */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 bg-zinc-950/85 backdrop-blur-xl border border-white/20 rounded-xl p-3.5 sm:p-5 shadow-2xl text-left max-w-[260px] sm:max-w-xs pointer-events-none">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[10px] sm:text-xs font-black tracking-wider text-white font-mono uppercase">
                  SYDNEY MARATHON
                </span>
                <span className="text-[9px] font-mono text-amber-400">2026</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 text-[10px] sm:text-xs">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-mono">Distance</span>
                  <span className="font-bold text-white font-mono">42.2 km</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-mono">Time</span>
                  <span className="font-bold text-white font-mono">3:14:26</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-mono">Elev Gain</span>
                  <span className="font-bold text-white font-mono">318 m</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-mono">Ave Pace</span>
                  <span className="font-bold text-white font-mono">4:36 /km</span>
                </div>
              </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-zinc-950/90 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-xl pointer-events-none">
              <GpxPhotosLogo variant="horizontal" size={20} theme="dark" />
            </div>

            {/* Interactive Preview Overlay Banner */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-zinc-300 font-mono text-[11px]">
                Live Showcase · Sydney Marathon Harbour Bridge with 3D GPX Laser Overlay
              </span>
              <button
                onClick={onOpenStudio}
                className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer shadow flex items-center gap-1.5"
              >
                <span>Customize in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEVICE COMPATIBILITY BAR */}
      <section className="border-y border-white/[0.08] bg-[#0E0E12] py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
            Compatible with all GPS sports watches, cycling computers & apps
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {devices.map((d) => (
              <div
                key={d.name}
                className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col items-center justify-center text-center"
              >
                <span className="text-xs font-bold text-zinc-200">{d.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 Simple Steps) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Raw Photo to 3D Finish Artwork in 30 Seconds
          </h2>
          <p className="text-sm text-zinc-400">
            No design software, 3D modeling skills, or account signups required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4 relative hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-white">Upload Your Photo</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drop any race day, training ride, summit, or trail photograph. The engine preserves 100% of your camera's native aspect ratio with zero forced cropping.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4 relative hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-white">Drop Your GPX Track</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Load your .GPX file from Strava or Garmin. The parser instantly calculates true ground distance, splits, elevation gain, and formats your metrics.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4 relative hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-white">Customize & Export</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Adjust route pitch, yaw, laser glow color, telemetry plaque position, and logo corner. Download the Free Social Edition ($0) or 4K Clean Master ($10).
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onOpenStudio}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <span>Launch Studio Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* 6. KEY FEATURES & 3D ENGINE */}
      <section id="features" className="py-20 border-t border-white/[0.08] bg-[#0E0E12]/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
              Under The Hood
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Endurance Athletes & Photographers
            </h2>
            <p className="text-sm text-zinc-400">
              Purpose-built 3D canvas pipeline combining mathematics and clean typography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <Compass className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">3D Perspective Ground Plane</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tilt and yaw your route in real time. Vanishing point compression anchors your route directly onto tarmac or trail surfaces.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <Layers className="w-5 h-5 text-sky-400" />
              <h4 className="text-sm font-bold text-white">Smoked Glass Telemetry HUD</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Display distance, finish time, elevation gain, and average pace on a glassmorphic plaque. Edit titles and splits to match your exact race bib.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Synchronized Elevation Profile</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatic elevation ribbon along the bottom margin highlights summit peaks and gradient shifts accumulated across the course.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <Sliders className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-bold text-white">Cinematic Atmosphere & LUTs</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enhance your photos with Golden Hour warmth, High-Contrast Editorial, or Cyber Twilight color grading presets with instant live feedback.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Zero Server Processing</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your photos and training data stay private. All calculations run strictly in client-side memory without third-party cloud uploads.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-3">
              <Download className="w-5 h-5 text-pink-400" />
              <h4 className="text-sm font-bold text-white">Up to 4K / 300 DPI Master Output</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export crisp PNG files at up to 3840px resolution, ready for framing, acrylic prints, Strava media feeds, and Instagram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRANSPARENT PRICING */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Free For Community. Master For Print.
          </h2>
          <p className="text-sm text-zinc-400">
            Official race photography packages charge $25 to $40+ for a single digital JPEG. We keep high-end finish art accessible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="p-7 rounded-2xl bg-zinc-900/40 border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Social Edition</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10">
                  Free Forever
                </span>
              </div>
              <div className="text-3xl font-black text-white">$0</div>
              <p className="text-xs text-zinc-400">
                Ideal for sharing your race accomplishment across Strava feeds, Instagram Stories, WhatsApp groups, and club chats.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 pt-3 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited photo & GPX uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3D perspective route & elevation ribbon</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Customizable glass HUD telemetry plaque</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Select any of 4 logo corners</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Includes gpx.photos hallmark emblem</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenStudio}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Start Free ($0)
            </button>
          </div>

          {/* Paid Master Tier */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-amber-500/10 via-zinc-900/80 to-zinc-950 border border-amber-400/40 flex flex-col justify-between space-y-6 shadow-2xl relative">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider font-mono shadow-md">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Clean 4K Master</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Unbranded
                </span>
              </div>
              <div className="text-3xl font-black text-amber-300">
                $10 <span className="text-xs text-zinc-400 font-normal">one-time download</span>
              </div>
              <p className="text-xs text-zinc-300">
                For athletes looking to print high-resolution framed posters, acrylic wall art, or completely unbranded editorial masters.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-200 pt-3 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>100% Watermark-Free</strong> (all logos removed)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>4K Ultra-HD Resolution</strong> (up to 3840px)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>300 DPI Print Quality</strong> for gallery framing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant digital PNG file delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Secure Paystack checkout with card or bank</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenStudio}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl text-xs font-bold text-zinc-950 transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer"
            >
              Open Studio & Create Master
            </button>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 border-t border-white/[0.08] bg-[#0E0E12]/40 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
              Answers & Guidance
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
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

      {/* 9. BOTTOM FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-8 text-center bg-gradient-to-b from-[#0E0E12] to-zinc-950 border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Celebrate Your Finish Line?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Load your adventure photo and GPX track right now. Instant, private, and free to create.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenStudio}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xl hover:shadow-amber-400/25 cursor-pointer"
            >
              <span>Launch Studio Free</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. MARKETING FOOTER */}
      <footer className="border-t border-white/10 bg-black/60 py-8 px-4 sm:px-8 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GpxPhotosLogo variant="horizontal" size={24} theme="dark" />
            <span className="text-[11px] text-zinc-400">
              © {new Date().getFullYear()} gpx.photos. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button onClick={onOpenStudio} className="hover:text-amber-300 transition-colors cursor-pointer">
              Open Studio
            </button>
            <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-amber-300 transition-colors">
              Pricing ($10 Master)
            </a>
            <a href="#faq" className="hover:text-amber-300 transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
