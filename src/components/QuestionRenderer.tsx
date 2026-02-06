import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface QuestionRendererProps {
  question: any;
  onAnswer: (answer: any) => void;
  showResult?: boolean;
  disabled?: boolean;
}

const QuestionRenderer = ({ question, onAnswer, showResult = false, disabled = false }: QuestionRendererProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);

  const handleAnswer = (answer: any) => {
    if (disabled) return;
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  // MCQ Type
  if (question.questionType === 'mcq') {
    return (
      <div className="space-y-3 w-full">
        {question.options?.map((option: any, index: number) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = showResult && option.isCorrect;
          const isWrong = showResult && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={disabled}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all block ${
                isCorrect ? 'bg-success/20 border-success' :
                isWrong ? 'bg-destructive/20 border-destructive animate-shake' :
                isSelected ? 'bg-primary/20 border-primary' :
                'bg-card border-border hover:border-primary/50'
              }`}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {option.key || String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-foreground flex-1">{option.text?.en || option.text}</span>
                {showResult && isCorrect && <Check className="w-5 h-5 text-success flex-shrink-0" />}
                {showResult && isWrong && <X className="w-5 h-5 text-destructive flex-shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Fill-in-the-Blank Type
  if (question.questionType === 'fill-blank') {
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
          <div className={`p-3 rounded-xl ${
            selectedAnswer?.toLowerCase() === correctAnswer?.toLowerCase()
              ? 'bg-success/20 border border-success/30'
              : 'bg-destructive/20 border border-destructive/30'
          }`}>
            <p className="text-sm font-medium">
              Correct Answer: <span className="font-bold">{correctAnswer}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Match Type
  if (question.questionType === 'match') {
    const { leftItems, rightItems, correctPairs } = question.typeData || {};
    const [matches, setMatches] = useState<any[]>([]);

    const handleMatch = (leftIndex: number, rightIndex: number) => {
      const newMatches = [...matches];
      const existingIndex = newMatches.findIndex(m => m[0] === leftIndex);
      if (existingIndex >= 0) {
        newMatches[existingIndex] = [leftIndex, rightIndex];
      } else {
        newMatches.push([leftIndex, rightIndex]);
      }
      setMatches(newMatches);
      handleAnswer(newMatches);
    };

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Match the items:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {leftItems?.map((item: string, index: number) => (
              <div key={index} className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-sm font-medium text-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems?.map((item: string, index: number) => (
              <button
                key={index}
                onClick={() => handleMatch(0, index)}
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

  // Diagram Label Type
  if (question.questionType === 'diagram-label') {
    const { imageUrl, labels } = question.typeData || {};
    return (
      <div className="space-y-4">
        <div className="relative">
          <img src={imageUrl} alt="Diagram" className="w-full rounded-xl" />
          {labels?.map((label: any, index: number) => (
            <div
              key={index}
              className="absolute"
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
            >
              <input
                type="text"
                onChange={(e) => handleAnswer({ ...selectedAnswer, [label.id]: e.target.value })}
                placeholder={`Label ${index + 1}`}
                className="w-24 px-2 py-1 text-xs rounded bg-background border border-border"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Numeric Type
  if (question.questionType === 'numeric') {
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
          <div className={`p-3 rounded-xl ${
            Math.abs(selectedAnswer - correctValue) <= (tolerance || 0)
              ? 'bg-success/20 border border-success/30'
              : 'bg-destructive/20 border border-destructive/30'
          }`}>
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
