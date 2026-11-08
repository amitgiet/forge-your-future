import React from 'react';
import { motion } from 'framer-motion';
import type { NormalizedQuestion, AnswerPayload, MatrixRowPair } from '@/lib/questionNormalization';
import { getCorrectOptionIndex } from '@/lib/questionNormalization';

export interface SpecializedRendererProps {
  question: NormalizedQuestion;
  answerPayload: AnswerPayload | null;
  onChange: (payload: AnswerPayload | null) => void;
  readOnly?: boolean;
}

export const MatchColumnRenderer: React.FC<SpecializedRendererProps> = ({
  question,
  answerPayload,
  onChange,
  readOnly = false,
}) => {
  const matrixData = question.typeData?.matrixData;
  const pairs: MatrixRowPair[] = matrixData?.pairs || [];
  const optionCodes: Record<string, string> = matrixData?.matrixOptions || {};
  const labels = ['A', 'B', 'C', 'D'];

  const optionsList = labels.map((key, index) => {
    if (optionCodes[key]) return optionCodes[key];
    if (Array.isArray(question.options)) return String(question.options[index] || '');
    if (question.options && typeof question.options === 'object') {
      const opts = question.options as Record<string, any>;
      return String(opts[key] ?? opts[key.toLowerCase()] ?? '');
    }
    return '';
  });

  const selectedIndex = answerPayload?.kind === 'mcq' ? answerPayload.selectedOption : null;
  const correctIdx = getCorrectOptionIndex(question);

  const handleSelectOption = (index: number) => {
    if (readOnly) return;
    if (selectedIndex === index) {
      onChange(null);
    } else {
      onChange({ kind: 'mcq', selectedOption: index });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {pairs.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider">
            <div className="w-[46%] text-sky-600 dark:text-sky-400">List - I</div>
            <div className="w-px h-4 bg-border mx-2" />
            <div className="w-[52%] text-slate-500 dark:text-slate-400">List - II</div>
          </div>

          <div className="divide-y divide-border/60">
            {pairs.map((pair, idx) => (
              <div key={pair.id || idx} className="flex items-start px-4 py-3 text-sm">
                <div className="w-[46%] flex items-start gap-2.5">
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                    {pair.leftLabel || `(${String.fromCharCode(97 + idx)})`}
                  </span>
                  <span className="font-medium text-foreground leading-relaxed">
                    {pair.leftText}
                  </span>
                </div>

                <div className="w-px self-stretch bg-border mx-2 flex-shrink-0" />

                <div className="w-[52%] flex items-start gap-2.5">
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                    {pair.rightLabel || `(${idx + 1})`}
                  </span>
                  <span className="font-medium text-foreground leading-relaxed">
                    {pair.rightText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select the correct matching code:
        </p>

        <div className="space-y-2">
          {optionsList.map((codeText, index) => {
            if (!codeText) return null;
            const isSelected = selectedIndex === index;
            const isCorrect = correctIdx === index;

            let cardStyle = 'border-border bg-card hover:border-primary/40 hover:bg-primary/5';
            let badgeStyle = 'border-muted-foreground/30 text-muted-foreground bg-muted/40';

            if (readOnly) {
              if (isCorrect) {
                cardStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
                badgeStyle = 'border-emerald-500 bg-emerald-500 text-white';
              } else if (isSelected && !isCorrect) {
                cardStyle = 'border-destructive bg-destructive/10 text-destructive';
                badgeStyle = 'border-destructive bg-destructive text-white';
              }
            } else if (isSelected) {
              cardStyle = 'border-primary bg-primary/10 shadow-sm';
              badgeStyle = 'border-primary bg-primary text-primary-foreground';
            }

            return (
              <motion.button
                key={labels[index]}
                type="button"
                onClick={() => handleSelectOption(index)}
                disabled={readOnly}
                whileTap={readOnly ? {} : { scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${cardStyle}`}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${badgeStyle}`}>
                  {labels[index]}
                </span>
                <span className="text-sm font-semibold tracking-wide text-foreground flex-1">
                  {codeText}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchColumnRenderer;
