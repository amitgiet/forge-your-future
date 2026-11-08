import React from 'react';
import type { ResolvedDiagram } from '@/lib/questionNormalization';
import DiagramLightboxViewer from '@/components/questions/DiagramLightboxViewer';

interface DiagramGalleryProps {
  diagrams?: ResolvedDiagram[];
  className?: string;
}

const DiagramGallery: React.FC<DiagramGalleryProps> = ({ diagrams = [], className = '' }) => {
  const visibleDiagrams = diagrams.filter((entry) => entry && (entry.imageUrl || entry.status === 'missing' || entry.status === 'error'));

  if (!visibleDiagrams.length) return null;

  return (
    <div className={`space-y-2.5 ${className}`.trim()}>
      {visibleDiagrams.map((diagram, index) => (
        diagram.imageUrl ? (
          <DiagramLightboxViewer
            key={`${diagram.ref}-${index}`}
            imageUrl={diagram.imageUrl}
            title={diagram.ref ? `Diagram (${diagram.ref})` : `Diagram ${index + 1}`}
            thumbnailHeight={260}
          />
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
