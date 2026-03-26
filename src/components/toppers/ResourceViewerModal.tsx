import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

type ResourceViewerModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onBack: () => void;
  children: ReactNode;
  headerMode?: 'default' | 'back-only' | 'hidden';
};

export default function ResourceViewerModal({
  open,
  title,
  onClose,
  onBack,
  children,
  headerMode = 'default',
}: ResourceViewerModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-background"
        >
          {headerMode !== 'hidden' ? (
            <div className="border-b border-border bg-background/95 p-4 backdrop-blur">
              <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
                <button
                  onClick={onBack}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {headerMode === 'default' ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{title}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
