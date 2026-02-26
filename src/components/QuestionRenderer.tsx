import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

type QuestionType = 'mcq' | 'fill-blank' | 'match' | 'diagram-label' | 'numeric' | 'numerical';

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

interface QuestionData {
  questionType?: QuestionType;
  type?: QuestionType;
  options?: OptionItem[] | string[];
  typeData?: {
    template?: string;
    correctAnswer?: string;
    leftItems?: string[];
    rightItems?: string[];
    correctPairs?: [number, number][];
    imageUrl?: string;
    labels?: DiagramLabel[];
    correctValue?: number;
    unit?: string;
    tolerance?: number;
  };
}

interface QuestionRendererProps {
  question: QuestionData;
  onAnswer: (answer: unknown) => void;
  showResult?: boolean;
  disabled?: boolean;
}

const QuestionRenderer = ({ question, onAnswer, showResult = false, disabled = false }: QuestionRendererProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [matches, setMatches] = useState<Array<[number, number]>>([]);
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);
  const questionType = question.questionType || question.type;

  const handleAnswer = (answer: unknown) => {
    if (disabled) return;
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  if (questionType === 'mcq') {
    return (
      <div className="space-y-3 w-full">
        {question.options?.map((option: OptionItem | string, index: number) => {
          const isSelected = selectedAnswer === index;
          const optionObj: OptionItem = typeof option === 'string' ? { text: option } : option;
          const isCorrect = showResult && Boolean(optionObj.isCorrect);
          const isWrong = showResult && isSelected && !optionObj.isCorrect;
          const optionText =
            typeof optionObj.text === 'string' ? optionObj.text : optionObj.text?.en || '';

          return (
            <motion.button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all block ${
                isCorrect
                  ? 'bg-success/20 border-success'
                  : isWrong
                    ? 'bg-destructive/20 border-destructive animate-shake'
                    : isSelected
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card border-border hover:border-primary/50'
              }`}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {optionObj.key || String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-foreground flex-1">{optionText}</span>
                {showResult && isCorrect && <Check className="w-5 h-5 text-success flex-shrink-0" />}
                {showResult && isWrong && <X className="w-5 h-5 text-destructive flex-shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (questionType === 'fill-blank') {
    const { template, correctAnswer } = question.typeData || {};
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-foreground mb-4">{template}</p>
        <input
          type="text"
          onChange={(e) => handleAnswer(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {showResult && (
          <div
            className={`p-3 rounded-xl ${
              String(selectedAnswer || '').toLowerCase() === String(correctAnswer || '').toLowerCase()
                ? 'bg-success/20 border border-success/30'
                : 'bg-destructive/20 border border-destructive/30'
            }`}
          >
            <p className="text-sm font-medium">
              Correct Answer: <span className="font-bold">{correctAnswer}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

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
                onClick={() => setSelectedLeftIndex(index)}
                className={`w-full p-3 rounded-xl border text-sm font-medium text-left ${
                  selectedLeftIndex === index
                    ? 'bg-primary/20 border-primary'
                    : 'bg-primary/10 border-primary/30 text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems?.map((item: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  if (selectedLeftIndex !== null) {
                    handleMatch(selectedLeftIndex, index);
                  }
                }}
                className="w-full p-3 rounded-xl bg-card border-2 border-border hover:border-primary/50 text-sm font-medium text-foreground text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (questionType === 'diagram-label') {
    const { imageUrl, labels } = question.typeData || {};
    return (
      <div className="space-y-4">
        <div className="relative">
          <img src={imageUrl} alt="Diagram" className="w-full rounded-xl" />
          {labels?.map((label: DiagramLabel, index: number) => (
            <div key={index} className="absolute" style={{ left: `${label.x}%`, top: `${label.y}%` }}>
              <input
                type="text"
                onChange={(e) =>
                  handleAnswer({ ...(typeof selectedAnswer === 'object' && selectedAnswer ? selectedAnswer as Record<string, string> : {}), [label.id]: e.target.value })
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

  if (questionType === 'numeric' || questionType === 'numerical') {
    const { correctValue, unit, tolerance } = question.typeData || {};
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="number"
            onChange={(e) => handleAnswer(parseFloat(e.target.value))}
            disabled={disabled}
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
