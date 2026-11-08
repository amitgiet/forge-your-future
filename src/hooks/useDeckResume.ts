import { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '@/lib/apiService';

interface UseDeckResumeOptions {
  deckType: 'formula' | 'flashcard';
  chapterTitle: string;
}

export interface QueuedReview {
  cardId: string;
  quality: number;
  timeSpentSeconds?: number;
  isBookmarked?: boolean;
  topicTitle?: string;
}

export const getStoredResumeIndex = (deckType: 'formula' | 'flashcard', chapterTitle: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const key = `@neetforge:revision_resume:v1:${deckType}:${chapterTitle}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.lastCardIndex === 'number' && parsed.lastCardIndex >= 0) {
        return parsed.lastCardIndex;
      }
    }
  } catch (err) {
    console.warn('Failed reading stored resume pointer:', err);
  }
  return 0;
};

export function useDeckResume({ deckType, chapterTitle }: UseDeckResumeOptions) {
  const [resumeIndex, setResumeIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const queueRef = useRef<QueuedReview[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `@neetforge:revision_resume:v1:${deckType}:${chapterTitle}`;

  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.lastCardIndex === 'number') {
          setResumeIndex(parsed.lastCardIndex);
        }
      }
    } catch (err) {
      console.warn('Failed reading resume state:', err);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  const flushQueue = useCallback(async () => {
    if (!queueRef.current.length) return;

    const reviewsToFlush = [...queueRef.current];
    queueRef.current = [];

    try {
      if (deckType === 'flashcard') {
        await apiService.flashcards.syncBatchProgress({
          chapterTitle,
          lastCardIndex: resumeIndex,
          reviews: reviewsToFlush,
        });
      } else {
        await apiService.formulas.syncBatchProgress({
          chapterTitle,
          lastCardIndex: resumeIndex,
          reviews: reviewsToFlush,
        });
      }
    } catch (err) {
      console.warn('Batch progress sync failed, re-queuing:', err);
      queueRef.current = [...reviewsToFlush, ...queueRef.current];
    }
  }, [deckType, chapterTitle, resumeIndex]);

  const recordReview = useCallback(
    (review: QueuedReview, nextCardIndex?: number) => {
      queueRef.current.push(review);
      const nextIndex = typeof nextCardIndex === 'number' ? nextCardIndex : resumeIndex + 1;
      setResumeIndex(nextIndex);

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            lastCardIndex: nextIndex,
            lastStudiedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.warn('Failed writing resume state:', err);
      }

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(flushQueue, 3500);
    },
    [storageKey, resumeIndex, flushQueue]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushQueue();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushQueue();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      flushQueue();
    };
  }, [flushQueue]);

  return {
    resumeIndex,
    isLoaded,
    recordReview,
    flushQueue,
  };
}
