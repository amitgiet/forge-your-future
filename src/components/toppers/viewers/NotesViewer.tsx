import { useMemo, useState } from 'react';
import type { PageFile, NotesResource } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { getPageImageCandidates, toEmbedDriveUrl } from '@/components/toppers/utils';

type NotesViewerProps = {
  notes?: NotesResource;
};

function NotesPageImage({ page }: { page: PageFile }) {
  const candidates = useMemo(() => getPageImageCandidates(page), [page]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = candidates[candidateIndex] || '';

  if (!src) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-muted px-4 text-center text-sm text-muted-foreground">
        Image URL missing for page {page.pageId}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Page ${page.pageId}`}
      className="w-full rounded-2xl bg-muted object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((current) => current + 1);
        }
      }}
    />
  );
}

export default function NotesViewer({ notes }: NotesViewerProps) {
  if (!notes?.mode) {
    return <EmptyResourceState title="Notes unavailable" description="This chapter does not have notes available yet." />;
  }

  if (notes.mode === 'pdf' && notes.driveLink) {
    return (
      <div className="h-full w-full bg-background">
        <iframe
          src={toEmbedDriveUrl(notes.driveLink)}
          title="Chapter Notes"
          className="h-[calc(100vh-73px)] w-full border-0"
        />
      </div>
    );
  }

  if (notes.mode === 'image_pages' && (notes.pageFiles || []).length > 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
        {(notes.pageFiles || []).map((page) => (
          <div key={page.pageId} className="glass-card overflow-hidden rounded-3xl border border-border p-2">
            <NotesPageImage page={page} />
          </div>
        ))}
      </div>
    );
  }

  return <EmptyResourceState title="Notes unavailable" description="The notes payload is incomplete for this chapter." />;
}
