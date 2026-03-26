import type { NotesResource } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { getPageImageUrl, toEmbedDriveUrl } from '@/components/toppers/utils';

type NotesViewerProps = {
  notes?: NotesResource;
};

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
            <img
              src={getPageImageUrl(page)}
              alt={`Page ${page.pageId}`}
              className="w-full rounded-2xl bg-muted object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  return <EmptyResourceState title="Notes unavailable" description="The notes payload is incomplete for this chapter." />;
}
