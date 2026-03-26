import type { LucideIcon } from 'lucide-react';
import type { ResourceTile } from '@/components/toppers/types';

type ResourceCardProps = {
  tile: ResourceTile;
  icon: LucideIcon;
  accentClass: string;
  onClick: () => void;
};

export default function ResourceCard({ tile, icon: Icon, accentClass, onClick }: ResourceCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card flex min-h-[164px] flex-col justify-between rounded-3xl border border-border p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-accent/10"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 ${accentClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-bold text-foreground">{tile.title}</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{tile.description}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-primary">{tile.countLabel}</p>
      </div>
    </button>
  );
}
