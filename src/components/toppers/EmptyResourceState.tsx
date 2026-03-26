import type { ReactNode } from 'react';

type EmptyResourceStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyResourceState({ title, description, action }: EmptyResourceStateProps) {
  return (
    <div className="glass-card rounded-3xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
        📚
      </div>
      <h3 className="nf-heading text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
