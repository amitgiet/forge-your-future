import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { AnswerPayload, NormalizedQuestion } from '@/lib/questionNormalization';
import { AssertionReasonRenderer } from '@/components/questions/AssertionReasonRenderer';
import { StatementRenderer } from '@/components/questions/StatementRenderer';
import { MatchColumnRenderer } from '@/components/questions/MatchColumnRenderer';
import { SyllableChipAssembler } from '@/components/questions/SyllableChipAssembler';

type LegacyQuestionType = 'mcq' | 'fill-blank' | 'match' | 'diagram-label' | 'numeric' | 'numerical' | 'assertion_reason' | 'statement' | 'fillup' | 'order' | 'flashcard' | 'video';

interface OptionItem {
  key?: string;
  text?: string | { en?: string };
  isCorrect?: boolean;
}

interface DiagramLabel {
  id: string;
  x: number;
  y: number;
}

export interface QuestionRendererProps {
  question: any;
  answerPayload?: AnswerPayload | null;
  onAnswer?: (answer: unknown) => void;
  onChange?: (answer: AnswerPayload | null) => void;
  showResult?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answerPayload,
  onAnswer,
  onChange,
  showResult = false,
  disabled = false,
  readOnly = false,
}) => {
  const isLocked = Boolean(disabled || readOnly);
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [matches, setMatches] = useState<Array<[number, number]>>([]);
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);

  const questionType: LegacyQuestionType = (question?.questionType || question?.type || 'mcq') as LegacyQuestionType;
  const kind = question?.typeData?.kind;

  const currentPayload: AnswerPayload | null = answerPayload ?? (
    typeof selectedAnswer === 'number'
      ? { kind: 'mcq', selectedOption: selectedAnswer }
      : typeof selectedAnswer === 'string'
        ? { kind: 'fillup', value: selectedAnswer }
        : (selectedAnswer as AnswerPayload | null)
  );

  const handleSpecializedChange = (payload: AnswerPayload | null) => {
    if (isLocked) return;
    setSelectedAnswer(payload);
    onChange?.(payload);
    if (onAnswer) {
      if (payload?.kind === 'mcq') {
        onAnswer(payload.selectedOption);
      } else if (payload?.kind === 'fillup') {
        onAnswer(payload.value);
      } else {
        onAnswer(payload);
      }
    }
  };

  const handleAnswer = (answer: unknown) => {
    if (isLocked) return;
    setSelectedAnswer(answer);
    onAnswer?.(answer);
    if (onChange) {
      if (typeof answer === 'number') {
        onChange({ kind: 'mcq', selectedOption: answer });
      } else if (typeof answer === 'string') {
        onChange({ kind: 'fillup', value: answer });
      } else if (typeof answer === 'object' && answer !== null && 'kind' in answer) {
        onChange(answer as AnswerPayload);
      }
    }
  };

  // 1. Assertion-Reason High Fidelity Routing
  if (kind === 'assertion_reason' || questionType === 'assertion_reason') {
    return (
      <AssertionReasonRenderer
        question={question as NormalizedQuestion}
        answerPayload={currentPayload}
        onChange={handleSpecializedChange}
        readOnly={isLocked}
      />
    );
  }

  // 2. Statement I & II High Fidelity Routing
  if (kind === 'statement' || questionType === 'statement') {
    return (
      <StatementRenderer
        question={question as NormalizedQuestion}
        answerPayload={currentPayload}
        onChange={handleSpecializedChange}
        readOnly={isLocked}
      />
    );
  }

  // 3. Matrix Match Column Routing
  if (kind === 'match' || question?.typeData?.matrixData) {
    return (
      <MatchColumnRenderer
        question={question as NormalizedQuestion}
        answerPayload={currentPayload}
        onChange={handleSpecializedChange}
        readOnly={isLocked}
      />
    );
  }

  // 4. Syllable Chip Cloze Assembler Routing
  if (
    (questionType === 'fillup' || questionType === 'fill-blank') &&
    question?.typeData?.syllables?.syllableTokens?.length
  ) {
    return (
      <SyllableChipAssembler
        question={question as NormalizedQuestion}
        answerPayload={currentPayload}
        onChange={handleSpecializedChange}
        readOnly={isLocked}
      />
    );
  }

  // 5. Standard Multiple Choice (MCQ)
  if (questionType === 'mcq') {
    const rawOptions = question.options || question.typeData?.options;
    const optionsArray = Array.isArray(rawOptions)
      ? rawOptions
      : typeof rawOptions === 'object' && rawOptions !== null
        ? ['A', 'B', 'C', 'D'].map((key) => rawOptions[key] ?? rawOptions[key.toLowerCase()] ?? '')
        : [];

    return (
      <div className="space-y-3 w-full">
        {optionsArray.map((option: OptionItem | string, index: number) => {
          const isSelected =
            currentPayload?.kind === 'mcq'
              ? currentPayload.selectedOption === index
              : selectedAnswer === index;

          const optionObj: OptionItem = typeof option === 'string' ? { text: option } : option;
          const isCorrect = showResult && Boolean(optionObj.isCorrect);
          const isWrong = showResult && isSelected && !optionObj.isCorrect;
          const optionText =
            typeof optionObj.text === 'string' ? optionObj.text : optionObj.text?.en || '';

          return (
            <motion.button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isLocked}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all block ${
                isCorrect
                  ? 'bg-success/20 border-success'
                  : isWrong
                    ? 'bg-destructive/20 border-destructive animate-shake'
                    : isSelected
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card border-border hover:border-primary/50'
              }`}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {optionObj.key || String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-foreground flex-1 whitespace-pre-wrap">{optionText}</span>
                {showResult && isCorrect && <Check className="w-5 h-5 text-success flex-shrink-0" />}
                {showResult && isWrong && <X className="w-5 h-5 text-destructive flex-shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // 6. Fill in the Blank (Generic)
  if (questionType === 'fill-blank' || questionType === 'fillup') {
    const { template, correctAnswer, primaryAnswer } = question.typeData || {};
    const expected = correctAnswer || primaryAnswer || question.correctAnswer;
    const value = currentPayload?.kind === 'fillup' ? currentPayload.value : String(selectedAnswer || '');

    return (
      <div className="space-y-4">
        {template ? (
          <p className="text-lg font-medium text-foreground mb-4 whitespace-pre-wrap">{template}</p>
        ) : null}
        <input
          type="text"
          value={value}
          onChange={(e) => handleAnswer(e.target.value)}
          disabled={isLocked}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {showResult && expected && (
          <div
            className={`p-3 rounded-xl ${
              String(value).toLowerCase() === String(expected).toLowerCase()
                ? 'bg-success/20 border border-success/30'
                : 'bg-destructive/20 border border-destructive/30'
            }`}
          >
            <p className="text-sm font-medium">
              Correct Answer: <span className="font-bold">{expected}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // 7. Interactive Match
  if (questionType === 'match') {
    const { leftItems, rightItems } = question.typeData || {};

    const handleMatch = (leftIndex: number, rightIndex: number) => {
      const newMatches = [...matches];
      const existingIndex = newMatches.findIndex((m) => m[0] === leftIndex);
      if (existingIndex >= 0) {
        newMatches[existingIndex] = [leftIndex, rightIndex];
      } else {
        newMatches.push([leftIndex, rightIndex]);
      }
      setMatches(newMatches);
      handleAnswer(newMatches);
      setSelectedLeftIndex(null);
    };

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Match the items:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {leftItems?.map((item: string, index: number) => (
              <button
                key={index}
                disabled={isLocked}
                onClick={() => setSelectedLeftIndex(index)}
                className={`w-full p-3 rounded-xl border text-sm font-medium text-left ${
                  selectedLeftIndex === index
                    ? 'bg-primary/20 border-primary'
                    : 'bg-primary/10 border-primary/30 text-foreground'
                }`}
              >
                <span className="whitespace-pre-wrap">{item}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems?.map((item: string, index: number) => (
              <button
                key={index}
                disabled={isLocked}
                onClick={() => {
                  if (selectedLeftIndex !== null) {
                    handleMatch(selectedLeftIndex, index);
                  }
                }}
                className="w-full p-3 rounded-xl bg-card border-2 border-border hover:border-primary/50 text-sm font-medium text-foreground text-left"
              >
                <span className="whitespace-pre-wrap">{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. Diagram Labeling
  if (questionType === 'diagram-label') {
    const { imageUrl, labels } = question.typeData || {};
    return (
      <div className="space-y-4">
        <div className="relative">
          {imageUrl && <img src={imageUrl} alt="Diagram" className="w-full rounded-xl" />}
          {labels?.map((label: DiagramLabel, index: number) => (
            <div key={index} className="absolute" style={{ left: `${label.x}%`, top: `${label.y}%` }}>
              <input
                type="text"
                disabled={isLocked}
                onChange={(e) =>
                  handleAnswer({
                    ...(typeof selectedAnswer === 'object' && selectedAnswer ? (selectedAnswer as Record<string, string>) : {}),
                    [label.id]: e.target.value,
                  })
                }
                placeholder={`Label ${index + 1}`}
                className="w-24 px-2 py-1 text-xs rounded bg-background border border-border"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. Numeric / Numerical
  if (questionType === 'numeric' || questionType === 'numerical') {
    const { correctValue, unit, tolerance } = question.typeData || {};
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="number"
            onChange={(e) => handleAnswer(parseFloat(e.target.value))}
            disabled={isLocked}
            placeholder="Enter value"
            className="flex-1 px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
        {showResult && (
          <div
            className={`p-3 rounded-xl ${
              Math.abs(Number(selectedAnswer) - Number(correctValue)) <= (tolerance || 0)
                ? 'bg-success/20 border border-success/30'
                : 'bg-destructive/20 border border-destructive/30'
            }`}
          >
            <p className="text-sm font-medium">
              Correct Answer: <span className="font-bold">{correctValue} {unit}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return <div className="text-muted-foreground">Unsupported question type</div>;
};

export default QuestionRenderer;
