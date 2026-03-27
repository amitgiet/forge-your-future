import { useState } from 'react';
import type { ContentItem } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { toEmbedDriveUrl } from '@/components/toppers/utils';

type PodcastViewerProps = {
  podcasts: ContentItem[];
};

type Lang = 'en' | 'hi';

function isGoogleDriveUrl(value?: string | null): boolean {
  return /google\.com|googleusercontent\.com/i.test(String(value || '').trim());
}

/**
 * Google Drive audio is more reliable via preview iframe.
 * Direct audio URLs still use the native audio element.
 */
function resolveAudioSource(
  driveLink?: string | null,
  driveId?: string | null,
): { url: string | null; isEmbedMode: boolean } {
  const rawLink = String(driveLink || '').trim();

  if (rawLink) {
    if (isGoogleDriveUrl(rawLink)) {
      return { url: toEmbedDriveUrl(rawLink), isEmbedMode: true };
    }

    return { url: rawLink, isEmbedMode: false };
  }

  if (driveId) {
    return {
      url: `https://drive.google.com/file/d/${driveId}/preview?rm=minimal`,
      isEmbedMode: true,
    };
  }

  return { url: null, isEmbedMode: false };
}

export default function PodcastViewer({ podcasts }: PodcastViewerProps) {
  const [lang, setLang] = useState<Lang>('hi');

  if (!podcasts.length) {
    return (
      <EmptyResourceState
        title="Podcast unavailable"
        description="No podcast episodes are available for this chapter."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-4">

      {/* ── Language Toggle ─────────────────── */}
      <div className="flex justify-center">
        <div
          className="relative flex items-center rounded-full border border-border bg-card p-1 gap-1 shadow-lg"
          role="group"
          aria-label="Select language"
        >
          {/* sliding pill */}
          <span
            aria-hidden
            className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-primary transition-all duration-300 ease-in-out"
            style={{ left: lang === 'hi' ? '4px' : '50%' }}
          />
          <button
            id="lang-toggle-hindi"
            onClick={() => setLang('hi')}
            className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-semibold transition-colors duration-200 ${lang === 'hi' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            🇮🇳 हिंदी
          </button>
          <button
            id="lang-toggle-english"
            onClick={() => setLang('en')}
            className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-semibold transition-colors duration-200 ${lang === 'en' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* ── Podcast Cards ─────────────────────────────────────────────────── */}
      {podcasts.map((podcast, index) => {
        let audioSource: { url: string | null; isEmbedMode: boolean };

        if (lang === 'hi') {
          audioSource = resolveAudioSource(
            podcast.hindiDriveLink || podcast.driveLink,
            podcast.hindiDriveLink ? null : (podcast.hindiDriveId || podcast.driveId),
          );
        } else {
          audioSource = resolveAudioSource(
            podcast.englishDriveLink || podcast.driveLink,
            podcast.englishDriveLink ? null : (podcast.englishDriveId || podcast.driveId),
          );
        }

        const { url: audioUrl, isEmbedMode } = audioSource;

        return (
          <div
            key={podcast.uniqueId}
            className="glass-card rounded-3xl border border-border p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Episode header */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Episode {index + 1}
                  <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {lang === 'hi' ? 'हिंदी AI Voice' : 'English AI Voice'}
                  </span>
                </p>
                <h3 className="mt-0.5 truncate text-base font-bold text-foreground">
                  {podcast.title || 'Podcast Episode'}
                </h3>
              </div>
            </div>

            {/* Description */}
            {podcast.question ? (
              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {podcast.question}
              </p>
            ) : null}

            {/* Audio player */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              {audioUrl ? (
                isEmbedMode ? (
                  <iframe
                    src={audioUrl}
                    title={podcast.title || `Podcast ${index + 1}`}
                    className="h-28 w-full border-0"
                    allow="autoplay"
                  />
                ) : (
                  <audio
                    key={`${podcast.uniqueId}-${lang}`}
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                )
              ) : (
                <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
                  Audio not yet available
                </div>
              )}
            </div>

            {/* Processing badge if TTS not ready yet */}
            {!audioUrl && (
              <p className="mt-2 text-center text-xs text-amber-400">
                ⏳ AI audio generation pending for this episode
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
