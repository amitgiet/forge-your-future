import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { NormalizedQuestion, AnswerPayload } from '@/lib/questionNormalization';
import { getCorrectOptionIndex } from '@/lib/questionNormalization';

export interface SpecializedRendererProps {
  question: NormalizedQuestion;
  answerPayload: AnswerPayload | null;
  onChange: (payload: AnswerPayload | null) => void;
  readOnly?: boolean;
}

const DEFAULT_AR_OPTIONS = [
  'Both (A) and (R) are true and (R) is the correct explanation of (A)',
  'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
  '(A) is true but (R) is false',
  'Both (A) and (R) are false',
];

export const AssertionReasonRenderer: React.FC<SpecializedRendererProps> = ({
  question,
  answerPayload,
  onChange,
  readOnly = false,
}) => {
  const arData = question.typeData?.assertionReason;
  const assertionText = arData?.assertion || '';
  const reasonText = arData?.reason || '';

  const [assertionEvaluation, setAssertionEvaluation] = useState<boolean | null>(null);
  const [reasonEvaluation, setReasonEvaluation] = useState<boolean | null>(null);

  const selectedIndex = answerPayload?.kind === 'mcq' ? answerPayload.selectedOption : null;
  const correctIdx = getCorrectOptionIndex(question);

  const labels = ['A', 'B', 'C', 'D'];

  const optionsList = labels.map((label, index) => {
    if (Array.isArray(question.options) && question.options[index]) {
      return String(question.options[index]);
    }
    if (question.options && typeof question.options === 'object') {
      const opts = question.options as Record<string, any>;
      const val = opts[label] ?? opts[label.toLowerCase()];
      if (val) return String(val);
    }
    return DEFAULT_AR_OPTIONS[index];
  });

  const handleSelectOption = (index: number) => {
    if (readOnly) return;
    if (selectedIndex === index) {
      onChange(null);
    } else {
      onChange({ kind: 'mcq', selectedOption: index });
    }
  };

  const toggleAssertionEvaluation = (isTrue: boolean) => {
    if (readOnly) return;
    setAssertionEvaluation((prev) => (prev === isTrue ? null : isTrue));
  };

  const toggleReasonEvaluation = (isTrue: boolean) => {
    if (readOnly) return;
    setReasonEvaluation((prev) => (prev === isTrue ? null : isTrue));
  };

  return (
    <div className="space-y-4 w-full">
      {/* 1. Assertion Card */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase">
            🔵 ASSERTION (A)
          </span>

          {!readOnly && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-muted-foreground mr-1">Evaluate (A):</span>
              <button
                type="button"
                onClick={() => toggleAssertionEvaluation(true)}
                className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                  assertionEvaluation === true
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600'
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => toggleAssertionEvaluation(false)}
                className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                  assertionEvaluation === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-rose-500/50 hover:text-rose-600'
                }`}
              >
                False
              </button>
            </div>
          )}
        </div>

        <p className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap">
          {assertionText}
        </p>
      </div>

      {/* 2. Reason Card */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-extrabold text-xs tracking-wider uppercase">
            🟣 REASON (R)
          </span>

          {!readOnly && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-muted-foreground mr-1">Evaluate (R):</span>
              <button
                type="button"
                onClick={() => toggleReasonEvaluation(true)}
                className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                  reasonEvaluation === true
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600'
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => toggleReasonEvaluation(false)}
                className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                  reasonEvaluation === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-rose-500/50 hover:text-rose-600'
                }`}
              >
                False
              </button>
            </div>
          )}
        </div>

        <p className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap">
          {reasonText}
        </p>
      </div>

      {/* 3. NTA 4 Options */}
      <div className="space-y-2.5 pt-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select the correct option:
        </p>

        <div className="space-y-2">
          {optionsList.map((optText, index) => {
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
                <span className="text-sm font-medium leading-relaxed text-foreground flex-1">
                  {optText}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssertionReasonRenderer;
