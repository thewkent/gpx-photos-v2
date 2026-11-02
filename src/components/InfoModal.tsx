import React from 'react';
import { X, Mail, Shield, FileText, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { GpxPhotosLogo } from './GpxPhotosLogo';

export type InfoModalTab = 'about' | 'contact' | 'terms' | 'privacy';

interface InfoModalProps {
  isOpen: boolean;
  activeTab: InfoModalTab;
  onClose: () => void;
  onSelectTab: (tab: InfoModalTab) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#121216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <GpxPhotosLogo variant="horizontal" size={26} theme="dark" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 border-l border-white/10 pl-3">
              Official Reference
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-white/5 bg-zinc-950/40 px-6 gap-2 pt-2">
          {[
            { id: 'about', label: 'About', icon: Info },
            { id: 'contact', label: 'Contact & Support', icon: Mail },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as InfoModalTab)}
                className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-white/[0.04]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>About gpx.photos</span>
              </h2>
              <p>
                <strong>gpx.photos</strong> was built for runners, cyclists, triathletes, and outdoor explorers who want to transform memorable finish-line photography into gallery-grade sports art.
              </p>
              <p>
                Unlike generic mobile photo apps that crop your images, downsample camera files, or require subscription locks, gpx.photos operates with zero software installations directly in your web browser.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-mono">
                    100% Client-Side
                  </span>
                  <p className="text-xs text-zinc-400">
                    All GPX parsing, 3D perspective projections, and 4K rendering run in your browser RAM. Your photos never leave your device.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-mono">
                    Zero-Crop Native Ratios
                  </span>
                  <p className="text-xs text-zinc-400">
                    Supports full-frame mirrorless, DSLR, and mobile aspect ratios (3:2, 4:3, 16:9, and smartphone vertical) without forced cropping.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-xs text-zinc-400">
                <p>
                  Entity: <strong>GPX Photos Studio Inc.</strong> • Operating Worldwide • Web: <a href="https://gpx.photos" className="text-amber-400 hover:underline">https://gpx.photos</a>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Contact &amp; Customer Support</span>
              </h2>
              <p>
                Have a question, feedback, or a feature suggestion? Our support team and developer desk are always available.
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="text-xs text-amber-300 font-mono uppercase tracking-wider">
                  Official Support &amp; Agent Desk
                </div>
                <div className="text-lg font-bold text-white">
                  <a
                    href="mailto:support@gpx.photos"
                    className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>support@gpx.photos</span>
                  </a>
                </div>
                <p className="text-xs text-zinc-400">
                  Response turnaround: typically within 24 hours Monday through Friday.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                  Direct Inquiries &amp; Partnerships
                </h3>
                <ul className="text-xs text-zinc-300 space-y-1.5 list-disc pl-5">
                  <li><strong>Race Directors &amp; Event Organizers:</strong> Inquire about custom branded event landing pages and route presets for your participants.</li>
                  <li><strong>Sports Photographers:</strong> Integrate automated batch overlay styling and licensing solutions.</li>
                  <li><strong>AI Agents &amp; Developers:</strong> See our <a href="/llms.txt" className="text-amber-400 hover:underline">/llms.txt</a> and <a href="/.well-known/mcp/server-card.json" className="text-amber-400 hover:underline">MCP Server Card</a> for automated integration.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Terms of Service</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Last updated: January 2026
              </p>

              <div className="space-y-3 text-xs text-zinc-300">
                <div>
                  <h3 className="font-semibold text-white">1. Use of Service</h3>
                  <p className="mt-1">
                    gpx.photos grants you a personal, non-exclusive license to use the browser-based studio to create GPS route art overlays on photographs you have the right to modify.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white">2. Free Social Edition ($0)</h3>
                  <p className="mt-1">
                    Free exports include the official gpx.photos hallmark logo badge. You are free to share these images on social media, Strava, Instagram, personal blogs, and prints for personal use.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white">3. Clean Master Edition ($10)</h3>
                  <p className="mt-1">
                    Upon payment of $10 USD via our payment processor (Paystack), you receive the right to download unbranded 4K high-resolution master exports without the hallmark badge for personal and commercial display.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white">4. User Content &amp; Intellectual Property</h3>
                  <p className="mt-1">
                    You retain 100% ownership of your photos and GPS files. Because our processing occurs client-side in your browser, gpx.photos never claims any ownership over your images or activity telemetry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Privacy Policy</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Last updated: January 2026 • 100% Zero-Upload Guarantee
              </p>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero Server Upload Guarantee</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your photos, GPX tracks, heart rate, pace, and biometric telemetry never leave your device. All calculations, 3D perspective mapping, and canvas image synthesis take place locally in your web browser memory.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div>
                  <h3 className="font-semibold text-white">1. Information We Do Not Collect</h3>
                  <p className="mt-1">
                    We do not store, view, or transmit your original photos, your geographic GPS waypoints, or your Strava/Garmin activity files.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white">2. Payment Processing</h3>
                  <p className="mt-1">
                    Payment information for the $10 Clean Master Edition is handled securely and directly by Paystack using PCI-DSS compliant infrastructure. gpx.photos never sees or stores your credit card number.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white">3. Privacy Inquiries</h3>
                  <p className="mt-1">
                    Questions regarding data privacy may be addressed to our privacy officer at <a href="mailto:support@gpx.photos" className="text-amber-400 hover:underline">support@gpx.photos</a>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@gpx.photos"
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Mail className="w-3 h-3 text-amber-400" />
              <span>support@gpx.photos</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
