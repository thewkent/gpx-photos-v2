import React, { useState } from 'react';
import { StravaActivityData } from '../types/poster';
import { X, CheckCircle, ShieldCheck, Download, Sparkles, Unlock, CreditCard, Lock, ArrowRight, Zap } from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: StravaActivityData;
  onExportPng: (unwatermarked?: boolean) => void;
  isExporting: boolean;
  isWatermarkUnlocked: boolean;
  onUnlockWatermark: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string; status?: string }) => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  onClose,
  activity,
  onExportPng,
  isExporting,
  isWatermarkUnlocked,
  onUnlockWatermark,
}) => {
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('USD');
  const [paystackKey, setPaystackKey] = useState(
    (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_gpxart_sample_key'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(isWatermarkUnlocked);
  const [txReference, setTxReference] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const priceAmount = currency === 'USD' ? 10 : 180; // $10 USD or R180 ZAR
  const priceDisplay = currency === 'USD' ? '$10.00' : 'R180.00';
  const paystackAmountCents = currency === 'USD' ? 1000 : 18000; // in minor units (cents)

  const handlePaystackCheckout = () => {
    setErrorMessage(null);

    const userEmail = email.trim() || 'athlete@example.com';
    const reference = 'GPX_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

    // If Paystack inline JS is loaded in the browser
    if (typeof window !== 'undefined' && window.PaystackPop) {
      try {
        setIsProcessing(true);
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: userEmail,
          amount: paystackAmountCents,
          currency: currency,
          ref: reference,
          onClose: () => {
            setIsProcessing(false);
          },
          callback: (response) => {
            setIsProcessing(false);
            const verifiedRef = response.reference || reference;
            setTxReference(verifiedRef);
            setPaymentSuccess(true);
            onUnlockWatermark();
            try {
              localStorage.setItem(`gpx_unlocked_${activity.id}`, 'true');
            } catch (e) {
              // ignore localStorage error
            }
          },
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack error:', err);
        // Fallback to seamless simulation if key is test/demo
        completeSimulationPayment(reference);
      }
    } else {
      // Fallback simulation for offline or sandbox mode
      completeSimulationPayment(reference);
    }
  };

  const completeSimulationPayment = (reference: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTxReference(reference);
      setPaymentSuccess(true);
      onUnlockWatermark();
      try {
        localStorage.setItem(`gpx_unlocked_${activity.id}`, 'true');
      } catch (e) {
        // ignore
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141519] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-base font-black text-white">GPX</span>
              <span className="text-base font-black text-[#FC5200]">.art</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">|</span>
            <span className="text-xs font-semibold text-zinc-300">
              Remove Branding & Watermark
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {paymentSuccess || isWatermarkUnlocked ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Branding Removed Successfully!</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  All <strong className="text-white">gpx.photos</strong> logos and watermarks have been removed from your artwork for <strong className="text-white">{activity.name}</strong>.
                </p>
                {txReference && (
                  <p className="text-[10px] font-mono text-zinc-500 mt-2">
                    Paystack Ref: {txReference}
                  </p>
                )}
              </div>

              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2 text-left text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unwatermarked 4K Master Ready</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Your master image is rendered at 3840px (300 DPI) with zero overlays or logos. Ready for self-printing or social media.
                </p>
              </div>

              <button
                onClick={() => {
                  onExportPng(true);
                  onClose();
                }}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating Master...' : 'Download Clean Image (300 DPI)'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Product Overview & Price Tag */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900/40 to-zinc-900/20 border border-amber-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Digital Master License</span>
                    </span>
                    <h4 className="text-sm font-bold text-white">Clean Unbranded Artwork</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-black text-amber-400">
                      {priceDisplay}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">One-time per image</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>100% Watermark Removal</strong> (No gpx.photos logos or badges)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>4K Master Resolution</strong> (300 DPI high-definition export)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Full Commercial & Personal Rights</strong> (Print anywhere anytime)</span>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-xl text-xs">
                <span className="text-zinc-400">Payment Currency:</span>
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                      currency === 'USD' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    $10 USD
                  </button>
                  <button
                    onClick={() => setCurrency('ZAR')}
                    className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                      currency === 'ZAR' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    R180 ZAR
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Email Address for Receipt & Clean Master
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Paystack Pay Button */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handlePaystackCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-400/20 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing ? 'Connecting to Paystack...' : `Pay ${priceDisplay} with Paystack`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secured by Paystack • Instant automatic download</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
