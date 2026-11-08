import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, RotateCcw, AlertTriangle, CheckCircle2, Bookmark, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface FlashcardItem {
  _id: string;
  cardId?: string;
  topicTitle?: string;
  title?: string;
  conceptSummary?: string;
  formulaLatex?: string;
  ncertPageReference?: string;
  diagramUrl?: string;
  imgUrl?: string;
  variables?: { symbol: string; meaning: string; unit: string }[];
  front?: {
    prompt: string;
    promptHi?: string | null;
    diagramUrl?: string | null;
    hint?: string | null;
  };
  back?: {
    answer: string;
    answerHi?: string | null;
    diagramUrl?: string | null;
    keyPoints?: string[];
    neetTraps?: string[];
    mnemonics?: string | null;
  };
  neetTraps?: string[];
  progress?: {
    isBookmarked?: boolean;
    status?: string;
    quality?: number;
    interval?: number;
    easeFactor?: number;
    nextReviewDate?: string;
  };
}

export interface WebFlipCard3DProps {
  card: FlashcardItem;
  isFlipped: boolean;
  onFlip: () => void;
  language?: 'en' | 'hi';
  onExpandDiagram?: (url: string, overlayUrl?: string) => void;
}

const normalizeUrl = (raw?: string | null): string => {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/drive\.google\.com|googleusercontent\.com/i.test(trimmed)) {
    const fromQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fromPath = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = fromQuery?.[1] || fromPath?.[1];
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
    }
  }
  return trimmed;
};

export const WebFlipCard3D: React.FC<WebFlipCard3DProps> = memo(({
  card,
  isFlipped,
  onFlip,
  language = 'en',
  onExpandDiagram,
}) => {
  const isFlashcard = Boolean(card.front && card.back);

  if (isFlashcard && card.front && card.back) {
    const promptText = language === 'hi' && card.front.promptHi
      ? card.front.promptHi
      : card.front.prompt;

    const answerText = language === 'hi' && card.back.answerHi
      ? card.back.answerHi
      : card.back.answer;

    const frontDiagram = normalizeUrl(card.front.diagramUrl);
    const backDiagram = normalizeUrl(card.back.diagramUrl);

    return (
      <div
        className="w-full max-w-xl mx-auto cursor-pointer"
        style={{ perspective: 1200 }}
        onClick={onFlip}
      >
        <motion.div
          className="relative w-full min-h-[480px] sm:min-h-[520px] rounded-2xl"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 100, mass: 0.8 }}
        >
          {/* ── FRONT FACE: Active Recall Prompt ── */}
          <div
            className={`w-full h-full min-h-[480px] sm:min-h-[520px] p-6 sm:p-7 flex flex-col justify-between bg-card text-card-foreground rounded-2xl border border-border shadow-xl overflow-y-auto ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div>
              {/* Header badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {card.topicTitle || 'Active Recall'}
                </span>
                {card.ncertPageReference && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    <BookOpen className="w-3 h-3" />
                    {card.ncertPageReference}
                  </span>
                )}
              </div>

              {/* Prompt Text */}
              <div className="prose prose-base dark:prose-invert max-w-none font-medium text-foreground leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {promptText}
                </ReactMarkdown>
              </div>

              {/* Unlabeled Front Diagram */}
              {frontDiagram ? (
                <div className="mt-4 relative group rounded-xl overflow-hidden border border-border bg-muted/40 p-2 flex items-center justify-center min-h-[160px] max-h-[220px]">
                  <img
                    src={frontDiagram}
                    alt="NCERT Concept Diagram"
                    className="max-h-[200px] w-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                  {onExpandDiagram && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandDiagram(frontDiagram, backDiagram || undefined);
                      }}
                      className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-all opacity-90 group-hover:opacity-100"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Zoom Diagram</span>
                    </button>
                  )}
                </div>
              ) : card.front.hint ? (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <span className="text-base leading-none">💡</span>
                  <div className="flex-1">
                    <span className="font-semibold">Hint: </span>
                    {card.front.hint}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Click card or press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono border border-border">Space</kbd> to reveal answer</span>
            </div>
          </div>

          {/* ── BACK FACE: Verified Solution & Analysis ── */}
          <div
            className={`absolute inset-0 w-full h-full min-h-[480px] sm:min-h-[520px] p-6 sm:p-7 flex flex-col justify-between bg-card text-card-foreground rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-2xl overflow-y-auto ${
              !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              {/* Header badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Solution
                </span>
                {card.ncertPageReference && (
                  <span className="text-xs text-muted-foreground font-mono">
                    Ref: {card.ncertPageReference}
                  </span>
                )}
              </div>

              {/* Answer Text */}
              <div className="prose prose-base dark:prose-invert max-w-none font-medium text-foreground leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answerText}
                </ReactMarkdown>
              </div>

              {/* Labeled Back Diagram */}
              {backDiagram ? (
                <div className="mt-4 relative group rounded-xl overflow-hidden border border-border bg-muted/40 p-2 flex items-center justify-center min-h-[160px] max-h-[220px]">
                  <img
                    src={backDiagram}
                    alt="NCERT Solution Labeled Diagram"
                    className="max-h-[200px] w-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                  {onExpandDiagram && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandDiagram(backDiagram, frontDiagram || undefined);
                      }}
                      className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Inspect Solution</span>
                    </button>
                  )}
                </div>
              ) : null}

              {/* Key Points */}
              {card.back.keyPoints && card.back.keyPoints.length > 0 && (
                <div className="mt-4 space-y-1.5 p-3 rounded-xl bg-muted/60 border border-border">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Key Retention Takeaways:
                  </div>
                  {card.back.keyPoints.slice(0, 3).map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* NEET Traps & Pitfalls */}
              {card.back.neetTraps && card.back.neetTraps.length > 0 && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-900 dark:text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>NEET Traps & Common Mistakes:</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-xs">
                    {card.back.neetTraps.slice(0, 2).map((tr, idx) => (
                      <li key={idx} className="leading-snug">{tr}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mnemonics if available */}
              {card.back.mnemonics && (
                <div className="mt-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                  <span className="font-semibold">Mnemonic: </span>
                  {card.back.mnemonics}
                </div>
              )}
            </div>

            {/* Bottom Flip Back Indicator */}
            <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Click card or press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono border border-border">Space</kbd> to flip back</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Fallback for formula card format
  const imageUrl = normalizeUrl(card.diagramUrl || card.imgUrl);
  return (
    <div
      className="w-full max-w-xl mx-auto cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full min-h-[460px] rounded-2xl"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 100, mass: 0.8 }}
      >
        {/* Front */}
        <div
          className={`w-full h-full min-h-[460px] p-6 flex flex-col justify-between bg-card text-card-foreground rounded-2xl border border-border shadow-xl ${
            isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {card.topicTitle || 'Formula Card'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
            {card.conceptSummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{card.conceptSummary}</p>
            )}
            {imageUrl && (
              <div className="mt-4 flex items-center justify-center max-h-[220px] rounded-xl overflow-hidden bg-muted/40 p-2 border border-border">
                <img src={imageUrl} alt={card.title} className="max-h-[200px] object-contain" />
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
            <span>Click to flip & inspect variables ↺</span>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 w-full h-full min-h-[460px] p-6 flex flex-col justify-between bg-card text-card-foreground rounded-2xl border border-blue-500/30 shadow-2xl ${
            !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                Formula Variables & Traps
              </span>
            </div>
            {card.formulaLatex && (
              <div className="p-3 rounded-xl bg-muted/70 font-mono text-center text-sm font-bold text-foreground mb-4">
                {card.formulaLatex}
              </div>
            )}
            {card.variables && card.variables.length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Variables:</div>
                {card.variables.map((v, i) => (
                  <div key={i} className="text-xs text-foreground flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-500">{v.symbol}</span>:
                    <span>{v.meaning} {v.unit ? `(${v.unit})` : ''}</span>
                  </div>
                ))}
              </div>
            )}
            {card.neetTraps && card.neetTraps.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200">
                <div className="font-bold mb-1 flex items-center gap-1 text-rose-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> NEET Trap:
                </div>
                {card.neetTraps.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
            <span>Click to flip back ↺</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

WebFlipCard3D.displayName = 'WebFlipCard3D';
