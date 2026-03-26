import { Atom, ChevronRight, FlaskConical, Leaf } from 'lucide-react';
import type { Subject } from '@/components/toppers/types';
import { SUBJECT_META } from '@/components/toppers/utils';

const icons = {
  biology: Leaf,
  chemistry: FlaskConical,
  physics: Atom,
};

type ResourceSubjectPickerProps = {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSelect: (subject: Subject) => void;
};

export default function ResourceSubjectPicker({
  subjects,
  selectedSubject,
  onSelect,
}: ResourceSubjectPickerProps) {
  return (
    <div className="space-y-4">
      {subjects.map((subject) => {
        const meta = SUBJECT_META[subject];
        const Icon = icons[subject];
        const active = selectedSubject === subject;

        return (
          <button
            key={subject}
            onClick={() => onSelect(subject)}
            className={`w-full rounded-3xl border border-border bg-gradient-to-br ${meta.from} ${meta.to} glass-card p-5 text-left transition-all hover:-translate-y-0.5 ${active ? 'ring-2 ring-primary/50' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl bg-background/70 p-3 ${meta.accent}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-foreground">{meta.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">Open notes and fun chapter resources</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
