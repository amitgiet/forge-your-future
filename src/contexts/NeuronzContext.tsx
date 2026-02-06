import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserQuestion {
  _id: string;
  questionId: string;
  level: number;
  nextRevision: string;
  lastReviewed: string;
  streak: number;
  isMastered: boolean;
  totalAttempts: number;
  correctAttempts: number;
}

interface DueQuestionsData {
  total: number;
  byLevel: {
    L1: UserQuestion[];
    L2: UserQuestion[];
    L3: UserQuestion[];
    L4: UserQuestion[];
    L5: UserQuestion[];
    L6: UserQuestion[];
    L7: UserQuestion[];
  };
  questions: UserQuestion[];
  dailyLimit: number;
  limitReached: boolean;
}

interface MasteryProgress {
  totalQuestions: number;
  masteredQuestions: number;
  masteryPercentage: number;
  averageLevel: number;
}

interface NeuronzContextType {
  dueQuestions: DueQuestionsData | null;
  masteryProgress: MasteryProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadDueQuestions: () => Promise<void>;
  processAnswer: (questionId: string, wasCorrect: boolean, timeSpent?: number) => Promise<any>;
  getMasteryProgress: () => Promise<void>;
  checkDailyLimit: () => Promise<any>;
  resetQuestionLevel: (questionId: string) => Promise<void>;
}

const NeuronzContext = createContext<NeuronzContextType | undefined>(undefined);

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const NeuronzProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dueQuestions, setDueQuestions] = useState<DueQuestionsData | null>(null);
  const [masteryProgress, setMasteryProgress] = useState<MasteryProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  // Load due questions for today
  const loadDueQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall('/neuronz/due');
      setDueQuestions(result.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load due questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Process quiz answer
  const processAnswer = async (questionId: string, wasCorrect: boolean, timeSpent = 0) => {
    try {
      setError(null);
      
      const result = await apiCall('/neuronz/answer', {
        method: 'POST',
        body: JSON.stringify({ questionId, wasCorrect, timeSpent }),
      });

      // Reload due questions after processing answer
      if (!result.limitReached) {
        await loadDueQuestions();
      }

      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process answer');
      throw err;
    }
  };

  // Get mastery progress
  const getMasteryProgress = async () => {
    try {
      setError(null);
      
      const result = await apiCall('/neuronz/mastery');
      setMasteryProgress(result.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get mastery progress');
    }
  };

  // Check daily limit
  const checkDailyLimit = async () => {
    try {
      setError(null);
      
      const result = await apiCall('/neuronz/limit');
      return result.data;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check daily limit');
      throw err;
    }
  };

  // Reset question to Level 1
  const resetQuestionLevel = async (questionId: string) => {
    try {
      setError(null);
      
      await apiCall(`/neuronz/reset/${questionId}`, {
        method: 'PUT',
      });

      // Reload due questions after reset
      await loadDueQuestions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset question level');
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    loadDueQuestions();
    getMasteryProgress();
  }, []);

  const value: NeuronzContextType = {
    dueQuestions,
    masteryProgress,
    isLoading,
    error,
    loadDueQuestions,
    processAnswer,
    getMasteryProgress,
    checkDailyLimit,
    resetQuestionLevel,
  };

  return (
    <NeuronzContext.Provider value={value}>
      {children}
    </NeuronzContext.Provider>
  );
};

export const useNeuronz = () => {
  const context = useContext(NeuronzContext);
  if (context === undefined) {
    throw new Error('useNeuronz must be used within a NeuronzProvider');
  }
  return context;
};

export default NeuronzContext;