import { ChevronRight, Loader2 } from 'lucide-react';
import type { ResourceChapterSummary } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';

type ResourceChapterListProps = {
  chapters: ResourceChapterSummary[];
  loading?: boolean;
  onSelect: (chapter: ResourceChapterSummary) => void;
};

export default function ResourceChapterList({ chapters, loading, onSelect }: ResourceChapterListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chapters.length) {
    return (
      <EmptyResourceState
        title="No resource chapters yet"
        description="This subject does not have Toppers' Essentials chapters available right now."
      />
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => (
        <button
          key={chapter.slug}
          onClick={() => onSelect(chapter)}
          className="glass-card flex w-full items-center gap-4 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-accent/10"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">{chapter.chapterName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chapter.availableResourceTypes.length} resource type{chapter.availableResourceTypes.length === 1 ? '' : 's'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
