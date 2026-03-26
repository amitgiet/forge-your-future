import { useMemo } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { ContentItem } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { toEmbedDriveUrl } from '@/components/toppers/utils';

type CrosswordViewerProps = {
  crosswords: ContentItem[];
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
  onBackToList: () => void;
};

export default function CrosswordViewer({
  crosswords,
  selectedIndex,
  onSelectIndex,
  onBackToList,
}: CrosswordViewerProps) {
  const validCrosswords = useMemo(
    () =>
      crosswords.filter((crossword) => {
        const raw = String(crossword.question || crossword.driveLink || '').trim();
        return Boolean(raw);
      }),
    [crosswords]
  );

  if (!crosswords.length) {
    return <EmptyResourceState title="Crosswords unavailable" description="No crossword entries are available for this chapter." />;
  }

  if (!validCrosswords.length) {
    return <EmptyResourceState title="Crosswords unavailable" description="No playable crossword links are available for this chapter." />;
  }

  const resolvedIndex = selectedIndex !== null
    ? Math.max(0, Math.min(selectedIndex, validCrosswords.length - 1))
    : null;
  const selectedCrossword = resolvedIndex !== null ? validCrosswords[resolvedIndex] : null;
  const selectedUrl = selectedCrossword ? String(selectedCrossword.question || selectedCrossword.driveLink || '').trim() : '';
  const embedUrl = selectedCrossword ? toEmbedDriveUrl(selectedUrl) : '';

  if (selectedCrossword && resolvedIndex !== null) {
    return (
      <div className="h-full w-full bg-background">
        <div className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
            <button
              onClick={onBackToList}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {selectedCrossword.title || `Crossword ${resolvedIndex + 1}`}
              </p>
            </div>
          </div>
        </div>
        <iframe
          src={embedUrl}
          title={selectedCrossword.title || `Crossword ${resolvedIndex + 1}`}
          className="h-[calc(100vh-82px)] w-full border-0 bg-background"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-4">
      <div className="mb-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Toppers&apos; Essentials</p>
        <h2 className="mt-2 text-xl font-bold text-foreground">Crosswords</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select a crossword to open it in full screen.</p>
      </div>

      <div className="space-y-3">
        {validCrosswords.map((crossword, index) => {
          return (
            <button
              key={crossword.uniqueId}
              onClick={() => onSelectIndex(index)}
              className="glass-card flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-4 text-left transition-colors hover:bg-accent/10"
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5 text-foreground break-words">
                  {crossword.title || `Crossword ${index + 1}`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
