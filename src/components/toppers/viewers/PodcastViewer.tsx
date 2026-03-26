import type { ContentItem } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { toEmbedDriveUrl } from '@/components/toppers/utils';

type PodcastViewerProps = {
  podcasts: ContentItem[];
};

export default function PodcastViewer({ podcasts }: PodcastViewerProps) {
  if (!podcasts.length) {
    return <EmptyResourceState title="Podcast unavailable" description="No podcast episodes are available for this chapter." />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
      {podcasts.map((podcast, index) => {
        const sourceUrl = podcast.driveLink || '';
        const isDirectAudio = /\.(mp3|m4a|wav|aac|ogg)$/i.test(sourceUrl);

        return (
          <div key={podcast.uniqueId} className="glass-card rounded-3xl border border-border p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Episode {index + 1}</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{podcast.title || 'Podcast Episode'}</h3>
            {podcast.question ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{podcast.question}</p>
            ) : null}

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              {isDirectAudio ? (
                <audio controls className="w-full">
                  <source src={sourceUrl} />
                </audio>
              ) : (
                <iframe
                  src={toEmbedDriveUrl(sourceUrl)}
                  title={podcast.title || `Podcast ${index + 1}`}
                  className="h-28 w-full border-0"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
