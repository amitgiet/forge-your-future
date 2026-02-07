import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_QUESTIONS = 'neuronz_questions';
const STORAGE_ANSWERED = 'neuronz_answered_today';
const STORAGE_LAST_DATE = 'neuronz_last_date';
const STORAGE_PRO = 'neuronz_pro';

export interface RevisionQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  level: number;
  nextRevisionDate: Date;
  lastAnswered?: Date;
  correctStreak: number;
}

interface RevisionStats {
  totalQuestions: number;
  dueToday: number;
  masteredCount: number;
  averageLevel: number;
}

interface RevisionContextType {
  questions: RevisionQuestion[];
  getDueQuestions: () => RevisionQuestion[];
  answerQuestion: (questionId: string, isCorrect: boolean) => void;
  addQuestion: (question: Omit<RevisionQuestion, 'level' | 'nextRevisionDate' | 'correctStreak'>) => void;
  getStats: () => RevisionStats;
  dailyLimit: number;
  answeredToday: number;
  isPro: boolean;
  setIsPro: (value: boolean) => void;
}

const LEVEL_INTERVALS: Record<number, number> = {
  1: 1, 2: 3, 3: 5, 4: 7, 5: 14, 6: 30, 7: 60,
};

const FREE_DAILY_LIMIT = 10;

const INITIAL_QUESTIONS: RevisionQuestion[] = [
  { id: '1', question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], correct: 1, explanation: 'Mitochondria produce ATP through cellular respiration.', topic: 'Cell Biology', level: 1, nextRevisionDate: new Date(), correctStreak: 0 },
  { id: '2', question: 'Which phase of mitosis involves chromosome alignment at the cell equator?', options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], correct: 1, explanation: 'During metaphase, chromosomes align along the metaphase plate.', topic: 'Cell Division', level: 2, nextRevisionDate: new Date(), correctStreak: 1 },
  { id: '3', question: 'DNA replication is described as:', options: ['Conservative', 'Semi-conservative', 'Dispersive', 'Random'], correct: 1, explanation: 'DNA replication is semi-conservative.', topic: 'Molecular Biology', level: 1, nextRevisionDate: new Date(), correctStreak: 0 },
  { id: '4', question: 'The process by which mRNA is synthesized from DNA is called:', options: ['Translation', 'Transcription', 'Replication', 'Transduction'], correct: 1, explanation: 'Transcription copies genetic information from DNA to mRNA.', topic: 'Molecular Biology', level: 3, nextRevisionDate: new Date(Date.now() - 86400000), correctStreak: 2 },
  { id: '5', question: 'Which enzyme unwinds the DNA double helix during replication?', options: ['DNA Polymerase', 'Helicase', 'Ligase', 'Primase'], correct: 1, explanation: 'Helicase breaks hydrogen bonds to unwind the DNA helix.', topic: 'Molecular Biology', level: 1, nextRevisionDate: new Date(), correctStreak: 0 },
  { id: '6', question: 'In which organelle does photosynthesis occur?', options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Vacuole'], correct: 1, explanation: 'Chloroplasts are the site of photosynthesis in plant cells.', topic: 'Plant Biology', level: 4, nextRevisionDate: new Date(Date.now() - 172800000), correctStreak: 3 },
];

const RevisionContext = createContext<RevisionContextType | undefined>(undefined);

function parseQuestions(saved: string | null): RevisionQuestion[] {
  if (!saved) return INITIAL_QUESTIONS;
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((q: RevisionQuestion) => ({
      ...q,
      nextRevisionDate: new Date(q.nextRevisionDate),
      lastAnswered: q.lastAnswered ? new Date(q.lastAnswered) : undefined,
    }));
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export const RevisionProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<RevisionQuestion[]>(INITIAL_QUESTIONS);
  const [answeredToday, setAnsweredToday] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedQ, savedA, savedDate, savedPro] = await Promise.all([
          AsyncStorage.getItem(STORAGE_QUESTIONS),
          AsyncStorage.getItem(STORAGE_ANSWERED),
          AsyncStorage.getItem(STORAGE_LAST_DATE),
          AsyncStorage.getItem(STORAGE_PRO),
        ]);
        setQuestions(parseQuestions(savedQ));
        const today = new Date().toDateString();
        if (savedDate === today && savedA != null) setAnsweredToday(parseInt(savedA, 10) || 0);
        if (savedPro === 'true') setIsPro(true);
      } catch (_) {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_QUESTIONS, JSON.stringify(questions));
  }, [questions, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_ANSWERED, String(answeredToday));
    AsyncStorage.setItem(STORAGE_LAST_DATE, new Date().toDateString());
  }, [answeredToday, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_PRO, String(isPro));
  }, [isPro, hydrated]);

  const calculateNextRevisionDate = (currentLevel: number, isCorrect: boolean): Date => {
    const newLevel = isCorrect ? Math.min(currentLevel + 1, 7) : Math.max(currentLevel - 1, 1);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + LEVEL_INTERVALS[newLevel]);
    nextDate.setHours(9, 0, 0, 0);
    return nextDate;
  };

  const getDueQuestions = (): RevisionQuestion[] => {
    const now = new Date();
    return questions
      .filter((q) => new Date(q.nextRevisionDate) <= now)
      .sort((a, b) => a.level - b.level);
  };

  const answerQuestion = (questionId: string, isCorrect: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newLevel = isCorrect ? Math.min(q.level + 1, 7) : Math.max(q.level - 1, 1);
        return {
          ...q,
          level: newLevel,
          correctStreak: isCorrect ? q.correctStreak + 1 : 0,
          lastAnswered: new Date(),
          nextRevisionDate: calculateNextRevisionDate(q.level, isCorrect),
        };
      })
    );
    setAnsweredToday((prev) => prev + 1);
  };

  const addQuestion = (question: Omit<RevisionQuestion, 'level' | 'nextRevisionDate' | 'correctStreak'>) => {
    setQuestions((prev) => [
      ...prev,
      { ...question, level: 1, nextRevisionDate: new Date(), correctStreak: 0 },
    ]);
  };

  const getStats = (): RevisionStats => {
    const due = getDueQuestions();
    const mastered = questions.filter((q) => q.level === 7);
    const avgLevel = questions.length ? questions.reduce((s, q) => s + q.level, 0) / questions.length : 0;
    return {
      totalQuestions: questions.length,
      dueToday: due.length,
      masteredCount: mastered.length,
      averageLevel: Math.round(avgLevel * 10) / 10,
    };
  };

  return (
    <RevisionContext.Provider
      value={{
        questions,
        getDueQuestions,
        answerQuestion,
        addQuestion,
        getStats,
        dailyLimit: FREE_DAILY_LIMIT,
        answeredToday,
        isPro,
        setIsPro,
      }}
    >
      {children}
    </RevisionContext.Provider>
  );
};

export const useRevision = () => {
  const context = useContext(RevisionContext);
  if (!context) throw new Error('useRevision must be used within a RevisionProvider');
  return context;
};
