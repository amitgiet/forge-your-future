import type { GridlockItem } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { toDirectImageUrl } from '@/components/toppers/utils';

type GridlockViewerProps = {
  gridlocks: GridlockItem[];
};

export default function GridlockViewer({ gridlocks }: GridlockViewerProps) {
  if (!gridlocks.length) {
    return <EmptyResourceState title="Gridlocks unavailable" description="No gridlock resources are available for this chapter." />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4">
      {gridlocks.map((gridlock, index) => (
        <div key={gridlock.uniqueId} className="glass-card overflow-hidden rounded-3xl border border-border">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Gridlock {index + 1}</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{gridlock.title || 'Gridlock Board'}</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full border-separate border-spacing-2">
              <thead>
                <tr>
                  {(gridlock.columns || []).map((column, columnIndex) => (
                    <th key={`${gridlock.uniqueId}-head-${columnIndex}`} className="rounded-2xl bg-primary/10 px-4 py-3 text-left text-xs uppercase tracking-wide text-primary">
                      {column.header || `Column ${columnIndex + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(...(gridlock.columns || []).map((column) => (column.cells || []).length), 0),
                }).map((_, rowIndex) => (
                  <tr key={`${gridlock.uniqueId}-row-${rowIndex}`}>
                    {(gridlock.columns || []).map((column, columnIndex) => {
                      const cell = column.cells?.[rowIndex];
                      return (
                        <td key={`${gridlock.uniqueId}-${columnIndex}-${rowIndex}`} className="min-w-[180px] rounded-2xl border border-border bg-card px-3 py-3 align-top">
                          {cell?.isImage ? (
                            <img
                              src={toDirectImageUrl(cell.driveLink || '', cell.driveId || null)}
                              alt={`Gridlock cell ${rowIndex + 1}`}
                              className="max-h-40 rounded-xl object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-foreground">{cell?.value || '—'}</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
