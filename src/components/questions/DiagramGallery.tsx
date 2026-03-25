import React from 'react';
import type { ResolvedDiagram } from '@/lib/questionNormalization';

interface DiagramGalleryProps {
  diagrams?: ResolvedDiagram[];
  className?: string;
}

const DiagramGallery: React.FC<DiagramGalleryProps> = ({ diagrams = [], className = '' }) => {
  const visibleDiagrams = diagrams.filter((entry) => entry && (entry.imageUrl || entry.status === 'missing' || entry.status === 'error'));

  if (!visibleDiagrams.length) return null;

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {visibleDiagrams.map((diagram, index) => (
        diagram.imageUrl ? (
          <div key={`${diagram.ref}-${index}`} className="rounded-xl overflow-hidden border border-border bg-card">
            <img
              src={diagram.imageUrl}
              alt={`Diagram ${index + 1}`}
              className="w-full object-contain max-h-72"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            key={`${diagram.ref}-${index}`}
            className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
          >
            Diagram not available{diagram.ref ? ` (${diagram.ref})` : ''}.
          </div>
        )
      ))}
    </div>
  );
};

export default DiagramGallery;
