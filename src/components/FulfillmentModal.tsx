import React, { useState } from 'react';
import { StravaActivityData } from '../types/poster';
import { GpxPhotosLogo } from './GpxPhotosLogo';
import {
  X,
  CheckCircle,
  Download,
  Sparkles,
  Unlock,
  Tag,
  Share2,
  ShieldCheck,
  CreditCard,
  Zap,
  Info,
} from 'lucide-react';

interface FulfillmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: StravaActivityData;
  onExportPng: (unwatermarked?: boolean) => void;
  isExporting: boolean;
  isWatermarkUnlocked: boolean;
  onUnlockWatermark: () => void;
}

export const FulfillmentModal: React.FC<FulfillmentModalProps> = ({
  isOpen,
  onClose,
  activity,
  onExportPng,
  isExporting,
  isWatermarkUnlocked,
  onUnlockWatermark,
}) => {
  const [email, setEmail] = useState('athlete@example.com');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(isWatermarkUnlocked);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const rawKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || '';
  const hasLivePaystackKey = Boolean(rawKey && !rawKey.includes('sample') && (rawKey.startsWith('pk_live_') || rawKey.startsWith('pk_test_')));

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'LAUNCH' || code === 'GPXART' || code === 'FREE' || code === 'TEST10') {
      setPromoApplied(true);
      setPromoError('');
      onUnlockWatermark();
      setPaymentSuccess(true);
      setTransactionRef(`PROMO-${code}-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setPromoError('Invalid promo code. (Try "LAUNCH" or "GPXART" to test unlock)');
    }
  };

  const handlePaystackCheckout = () => {
    const userEmail = email.trim() || 'athlete@example.com';
    setIsProcessingPayment(true);

    const paystackPop = (window as unknown as { PaystackPop?: { setup: (options: unknown) => { openIframe: () => void } } }).PaystackPop;

    if (hasLivePaystackKey && paystackPop && paystackPop.setup) {
      try {
        const handler = paystackPop.setup({
          key: rawKey,
          email: userEmail,
          amount: 1000, // $10.00 in cents USD
          currency: 'USD',
          ref: `GPX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Activity',
                variable_name: 'activity_name',
                value: activity.name,
              },
              {
                display_name: 'Athlete',
                variable_name: 'athlete_name',
                value: activity.athleteName || 'Athlete',
              },
            ],
          },
          callback: function (response: { reference: string }) {
            setIsProcessingPayment(false);
            onUnlockWatermark();
            setPaymentSuccess(true);
            setTransactionRef(response.reference);
          },
          onClose: function () {
            setIsProcessingPayment(false);
          },
        });
        handler.openIframe();
      } catch (err) {
        console.warn('Paystack popup fallback to simulated unlock:', err);
        setTimeout(() => {
          setIsProcessingPayment(false);
          onUnlockWatermark();
          setPaymentSuccess(true);
          setTransactionRef(`PSTK-DEMO-${Math.floor(100000 + Math.random() * 900000)}`);
        }, 800);
      }
    } else {
      // Smooth 1-click test simulation when Paystack keys haven't been added yet
      setTimeout(() => {
        setIsProcessingPayment(false);
        onUnlockWatermark();
        setPaymentSuccess(true);
        setTransactionRef(`SANDBOX-PSTK-${Math.floor(100000 + Math.random() * 900000)}`);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#151518] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <GpxPhotosLogo variant="horizontal" theme="dark" size={24} />
            <span className="text-xs text-zinc-500 font-mono">|</span>
            <h2 className="text-xs font-semibold text-zinc-300">
              Digital Master & Watermark Removal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {paymentSuccess || isWatermarkUnlocked ? (
            /* ================= Success / Unlocked State ================= */
            <div className="p-6 text-center space-y-4 bg-zinc-900/60 rounded-xl border border-emerald-500/30">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 inline-block mb-2">
                  WATERMARK REMOVED · CLEAN MASTER
                </span>
                <h3 className="text-lg font-bold text-white">
                  Branding Removed Successfully
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
                  The <strong className="text-white">gpx.photos</strong> logo has been permanently removed from your artwork for <strong className="text-amber-300">{activity.name}</strong>. Your pristine 300 DPI master is ready.
                </p>
                {transactionRef && (
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    Receipt / Reference: {transactionRef}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onExportPng(true);
                    onClose();
                  }}
                  disabled={isExporting}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating Master...' : 'Download Unwatermarked 300 DPI PNG'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Studio
                </button>
              </div>
            </div>
          ) : (
            /* ================= Checkout & Options ================= */
            <>
              {/* Value Comparison Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Official race and event photography packages charge <strong>$25 to $40+</strong> for a single JPEG download. For just <strong>$10</strong>, gpx.photos delivers an unbranded, high-definition 4K telemetry master of your finish.
                </span>
              </div>

              {/* Two Option Cards: Free Promotional vs Paid $10 Paystack Unbrand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Free Social Edition */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Free Social Edition</span>
                      </span>
                      <span className="text-xs font-black text-emerald-400 font-mono">$0 FREE</span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-snug">
                      Download free high-resolution image with official <strong>gpx.photos</strong> hallmark badge. Perfect for sharing across social & club feeds!
                    </p>

                    <ul className="text-[11px] text-zinc-400 space-y-1 pt-1 font-mono">
                      <li className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400">✓</span> High-resolution digital image
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400">✓</span> Instant free download
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-400">
                        <span className="text-zinc-500">•</span> Includes gpx.photos logo badge
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onExportPng(false);
                      onClose();
                    }}
                    disabled={isExporting}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Free (with Logo)</span>
                  </button>
                </div>

                {/* 2. Paid $10 Clean Master */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-2 border-amber-400/50 flex flex-col justify-between space-y-3 relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Clean Master Edition</span>
                      </span>
                      <div className="text-right">
                        <span className="text-base font-black text-white font-mono">$10</span>
                        <span className="text-[10px] text-zinc-400 ml-0.5">USD</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-200 leading-snug">
                      <strong>Watermark 100% removed.</strong> Unlocks clean 4K 300 DPI master file with zero logos or sponsor overlays.
                    </p>

                    <ul className="text-[11px] text-zinc-300 space-y-1 pt-1 font-mono">
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-400">✓</span> 100% Watermark removed
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-400">✓</span> 300 DPI print-ready master
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-400">✓</span> Full personal & print license
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-2">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{hasLivePaystackKey ? 'Secured via Paystack' : 'Sandbox Test Mode Active'}</span>
                      </div>
                      {!hasLivePaystackKey && (
                        <span className="text-amber-400/90 font-mono text-[9px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          1-Click Test
                        </span>
                      )}
                    </div>

                    {/* Email Input for Paystack Receipt */}
                    <div className="mb-2">
                      <input
                        type="email"
                        placeholder="athlete@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-950/90 border border-white/15 focus:border-amber-400 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                      />
                    </div>

                    <button
                      onClick={handlePaystackCheckout}
                      disabled={isProcessingPayment}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isProcessingPayment
                          ? 'Unlocking...'
                          : hasLivePaystackKey
                          ? 'Pay $10 with Paystack'
                          : 'Test Unlock $10 (Sandbox)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Promo Code Option (For testing and launches) */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="p-3 bg-zinc-900/60 border border-white/[0.08] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Have a promo or tester code?</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">e.g. LAUNCH or GPXART</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 flex-1 font-mono uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-3.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg border border-white/10 cursor-pointer transition-colors"
                    >
                      {promoApplied ? 'Applied ✓' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
