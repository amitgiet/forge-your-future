import { ArrowLeft, Sparkles } from 'lucide-react';

type ResourceChapterHeaderProps = {
  title: string;
  subtitle: string;
  categories: number;
  totalItems: number;
  onBack: () => void;
};

export default function ResourceChapterHeader({
  title,
  subtitle,
  categories,
  totalItems,
  onBack,
}: ResourceChapterHeaderProps) {
  return (
    <div className="glass-card rounded-3xl border border-border p-5">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Toppers&apos; Essentials</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="hidden rounded-2xl bg-warning/10 p-3 text-warning sm:block">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-primary/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
          <p className="mt-1 text-lg font-bold text-primary">{categories}</p>
        </div>
        <div className="rounded-2xl bg-warning/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Items</p>
          <p className="mt-1 text-lg font-bold text-warning">{totalItems}</p>
        </div>
      </div>
    </div>
  );
}
