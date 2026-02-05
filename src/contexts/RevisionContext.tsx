 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
 export interface RevisionQuestion {
   id: string;
   question: string;
   options: string[];
   correct: number;
   explanation: string;
   topic: string;
   level: number; // 1-7
   nextRevisionDate: Date;
   lastAnswered?: Date;
   correctStreak: number;
 }
 
 interface RevisionStats {
   totalQuestions: number;
   dueToday: number;
   masteredCount: number; // Level 7
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
   1: 1,      // +24h (1 day)
   2: 3,      // +3 days
   3: 5,      // +5 days
   4: 7,      // +7 days
   5: 14,     // +14 days
   6: 30,     // +30 days
   7: 60,     // +60 days (mastered)
 };
 
 const FREE_DAILY_LIMIT = 10;
 
 // Mock questions for demo
 const INITIAL_QUESTIONS: RevisionQuestion[] = [
   {
     id: '1',
     question: 'What is the powerhouse of the cell?',
     options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
     correct: 1,
     explanation: 'Mitochondria produce ATP through cellular respiration, providing energy for the cell.',
     topic: 'Cell Biology',
     level: 1,
     nextRevisionDate: new Date(),
     correctStreak: 0,
   },
   {
     id: '2',
     question: 'Which phase of mitosis involves chromosome alignment at the cell equator?',
     options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
     correct: 1,
     explanation: 'During metaphase, chromosomes align along the metaphase plate (cell equator).',
     topic: 'Cell Division',
     level: 2,
     nextRevisionDate: new Date(),
     correctStreak: 1,
   },
   {
     id: '3',
     question: 'DNA replication is described as:',
     options: ['Conservative', 'Semi-conservative', 'Dispersive', 'Random'],
     correct: 1,
     explanation: 'DNA replication is semi-conservative - each new DNA molecule has one original and one new strand.',
     topic: 'Molecular Biology',
     level: 1,
     nextRevisionDate: new Date(),
     correctStreak: 0,
   },
   {
     id: '4',
     question: 'The process by which mRNA is synthesized from DNA is called:',
     options: ['Translation', 'Transcription', 'Replication', 'Transduction'],
     correct: 1,
     explanation: 'Transcription is the process of copying genetic information from DNA to mRNA.',
     topic: 'Molecular Biology',
     level: 3,
     nextRevisionDate: new Date(Date.now() - 86400000), // Due yesterday
     correctStreak: 2,
   },
   {
     id: '5',
     question: 'Which enzyme unwinds the DNA double helix during replication?',
     options: ['DNA Polymerase', 'Helicase', 'Ligase', 'Primase'],
     correct: 1,
     explanation: 'Helicase breaks hydrogen bonds between base pairs to unwind the DNA helix.',
     topic: 'Molecular Biology',
     level: 1,
     nextRevisionDate: new Date(),
     correctStreak: 0,
   },
   {
     id: '6',
     question: 'In which organelle does photosynthesis occur?',
     options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Vacuole'],
     correct: 1,
     explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis in plant cells.',
     topic: 'Plant Biology',
     level: 4,
     nextRevisionDate: new Date(Date.now() - 172800000), // Due 2 days ago
     correctStreak: 3,
   },
 ];
 
 const RevisionContext = createContext<RevisionContextType | undefined>(undefined);
 
 export const RevisionProvider = ({ children }: { children: ReactNode }) => {
   const [questions, setQuestions] = useState<RevisionQuestion[]>(() => {
     const saved = localStorage.getItem('neuronz_questions');
     if (saved) {
       const parsed = JSON.parse(saved);
       return parsed.map((q: RevisionQuestion) => ({
         ...q,
         nextRevisionDate: new Date(q.nextRevisionDate),
         lastAnswered: q.lastAnswered ? new Date(q.lastAnswered) : undefined,
       }));
     }
     return INITIAL_QUESTIONS;
   });
 
   const [answeredToday, setAnsweredToday] = useState(() => {
     const saved = localStorage.getItem('neuronz_answered_today');
     const savedDate = localStorage.getItem('neuronz_last_date');
     const today = new Date().toDateString();
     if (savedDate === today && saved) {
       return parseInt(saved, 10);
     }
     return 0;
   });
 
   const [isPro, setIsPro] = useState(() => {
     return localStorage.getItem('neuronz_pro') === 'true';
   });
 
   // Persist to localStorage
   useEffect(() => {
     localStorage.setItem('neuronz_questions', JSON.stringify(questions));
   }, [questions]);
 
   useEffect(() => {
     localStorage.setItem('neuronz_answered_today', answeredToday.toString());
     localStorage.setItem('neuronz_last_date', new Date().toDateString());
   }, [answeredToday]);
 
   useEffect(() => {
     localStorage.setItem('neuronz_pro', isPro.toString());
   }, [isPro]);
 
   const calculateNextRevisionDate = (currentLevel: number, isCorrect: boolean): Date => {
     const newLevel = isCorrect 
       ? Math.min(currentLevel + 1, 7) 
       : Math.max(currentLevel - 1, 1);
     
     const daysToAdd = LEVEL_INTERVALS[newLevel];
     const nextDate = new Date();
     nextDate.setDate(nextDate.getDate() + daysToAdd);
     nextDate.setHours(9, 0, 0, 0); // Set to 9 AM
     return nextDate;
   };
 
   const getDueQuestions = (): RevisionQuestion[] => {
     const now = new Date();
     return questions
       .filter((q) => new Date(q.nextRevisionDate) <= now)
       .sort((a, b) => a.level - b.level); // Lower levels first (need more practice)
   };
 
   const answerQuestion = (questionId: string, isCorrect: boolean) => {
     setQuestions((prev) =>
       prev.map((q) => {
         if (q.id !== questionId) return q;
 
         const newLevel = isCorrect
           ? Math.min(q.level + 1, 7)
           : Math.max(q.level - 1, 1);
 
         const newStreak = isCorrect ? q.correctStreak + 1 : 0;
 
         return {
           ...q,
           level: newLevel,
           correctStreak: newStreak,
           lastAnswered: new Date(),
           nextRevisionDate: calculateNextRevisionDate(q.level, isCorrect),
         };
       })
     );
     setAnsweredToday((prev) => prev + 1);
   };
 
   const addQuestion = (question: Omit<RevisionQuestion, 'level' | 'nextRevisionDate' | 'correctStreak'>) => {
     const newQuestion: RevisionQuestion = {
       ...question,
       level: 1,
       nextRevisionDate: new Date(),
       correctStreak: 0,
     };
     setQuestions((prev) => [...prev, newQuestion]);
   };
 
   const getStats = (): RevisionStats => {
     const due = getDueQuestions();
     const mastered = questions.filter((q) => q.level === 7);
     const avgLevel = questions.reduce((sum, q) => sum + q.level, 0) / questions.length;
 
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
   if (!context) {
     throw new Error('useRevision must be used within a RevisionProvider');
   }
   return context;
 };