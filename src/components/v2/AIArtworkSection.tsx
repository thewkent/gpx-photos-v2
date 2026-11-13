import React, { useState } from 'react';
import { ActivityData } from '../../types/poster';
import { Aperture, Check, Clapperboard, Mountain, Newspaper, RotateCcw, Wand2 } from 'lucide-react';

type ArtworkStyle = 'cinematic' | 'terrain' | 'editorial';
interface AIArtworkSectionProps {
  photoUrl: string;
  onSelectPhoto: (url: string) => void;
  activity: ActivityData;
}

const STYLES: { id: ArtworkStyle; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cinematic', title: 'Cinematic', subtitle: 'Atmosphere, light & depth', icon: Clapperboard },
  { id: 'terrain', title: 'Terrain', subtitle: 'Landscape-inspired finish', icon: Mountain },
  { id: 'editorial', title: 'Editorial', subtitle: 'Premium sports photography', icon: Newspaper },
];

async function imageToDataUrl(url: string): Promise<{ dataUrl: string; mimeType: string; width: number; height: number }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load the source photo. Try uploading it again.');
  const blob = await response.blob();
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) throw new Error('For AI artwork, please use a JPEG, PNG or WebP photo.');
  if (blob.size > 16 * 1024 * 1024) throw new Error('Please use a photo smaller than 16 MB for this prototype.');

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the source photo.'));
    reader.readAsDataURL(blob);
  });
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Could not inspect the source photo.'));
    image.src = dataUrl;
  });
  return { dataUrl, mimeType: blob.type, ...dimensions };
}

function nearestAspectRatio(width: number, height: number): string {
  const options = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9'];
  const ratio = width / height;
  return options.reduce((best, current) => {
    const parts = current.split(':').map(Number);
    const bestParts = best.split(':').map(Number);
    return Math.abs(Math.log(ratio / (parts[0] / parts[1]))) < Math.abs(Math.log(ratio / (bestParts[0] / bestParts[1]))) ? current : best;
  }, '3:2');
}

export const AIArtworkSection: React.FC<AIArtworkSectionProps> = ({ photoUrl, onSelectPhoto, activity }) => {
  const [selectedStyle, setSelectedStyle] = useState<ArtworkStyle>('cinematic');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isShowingGenerated = Boolean(generatedUrl && photoUrl === generatedUrl);
  const sourcePhoto = isShowingGenerated && sourceUrl ? sourceUrl : photoUrl;

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const source = await imageToDataUrl(sourcePhoto);
      const response = await fetch('/api/ai-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: source.dataUrl,
          mimeType: source.mimeType,
          aspectRatio: nearestAspectRatio(source.width, source.height),
          style: selectedStyle,
          activityName: activity.name,
          sport: activity.sport,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'AI artwork generation failed.');
      if (typeof payload.imageDataUrl !== 'string' || !payload.imageDataUrl.startsWith('data:image/')) {
        throw new Error('The AI service returned an invalid image.');
      }
      setSourceUrl(sourcePhoto);
      setGeneratedUrl(payload.imageDataUrl);
      onSelectPhoto(payload.imageDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while creating the artwork.');
    } finally {
      setIsGenerating(false);
    }
  };

  const restoreOriginal = () => {
    if (sourceUrl) onSelectPhoto(sourceUrl);
    setGeneratedUrl(null);
    setSourceUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
            <Aperture className="w-4 h-4 text-orange-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Art Direction</h3>
            <p className="text-[11px] text-zinc-500">Let AI finish the photograph. Keep the data real.</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">
          Choose a photographic treatment. AI edits the image itself; your GPX route and statistics are still drawn separately from your actual activity data.
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-zinc-500">Choose an art direction</span>
        <div className="space-y-2">
          {STYLES.map((style) => {
            const Icon = style.icon;
            const selected = selectedStyle === style.id;
            const buttonClass = 'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ' +
              (selected ? 'bg-orange-500/[0.09] border-orange-400/50' : 'bg-zinc-900/60 border-white/[0.08] hover:border-white/20');
            return (
              <button key={style.id} type="button" onClick={() => setSelectedStyle(style.id)} disabled={isGenerating} className={buttonClass}>
                <div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (selected ? 'bg-orange-400/15 text-orange-300' : 'bg-white/[0.04] text-zinc-400')}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-white">{style.title}</span>
                  <span className="block text-[11px] text-zinc-500">{style.subtitle}</span>
                </div>
                {selected && <Check className="w-4 h-4 text-orange-300" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Selected treatment</span>
          <span className="text-[10px] font-mono text-orange-300">{STYLES.find((style) => style.id === selectedStyle)?.title}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {selectedStyle === 'cinematic' && 'Subtle directional light, atmospheric depth and a premium endurance-campaign finish.'}
          {selectedStyle === 'terrain' && 'Landscape-aware contour texture and atmospheric layers, kept delicate and integrated.'}
          {selectedStyle === 'editorial' && 'Refined colour, tonal separation and restrained film texture, like a premium sports magazine.'}
        </p>
      </div>

      <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-3">
        <p className="text-[10px] leading-relaxed text-zinc-400">
          <strong className="text-amber-200">Privacy:</strong> Creating AI artwork sends this photo to Google's Gemini image API for processing. gpx.photos does not save the uploaded image. AI may subtly change photographic details, so check the result before exporting.
        </p>
      </div>

      <button type="button" onClick={generate} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-950/30 transition-all disabled:opacity-60 disabled:cursor-wait">
        {isGenerating ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating your artwork...</> : <><Wand2 className="w-4 h-4" /> {isShowingGenerated ? 'Try another treatment' : 'Create AI artwork'}</>}
      </button>

      {isShowingGenerated && (
        <button type="button" onClick={restoreOriginal} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Restore original photograph
        </button>
      )}

      {error && <div role="alert" className="rounded-lg border border-rose-500/25 bg-rose-950/30 p-3 text-xs leading-relaxed text-rose-200">{error}</div>}

      <p className="text-[10px] text-zinc-600 leading-relaxed">Prototype mode · One image generation per click · Requires GEMINI_API_KEY on the server.</p>
    </div>
  );
};
