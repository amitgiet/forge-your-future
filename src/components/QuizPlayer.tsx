import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export interface QuizQuestion {
  _id?: string;
  id?: string;
  question: string;
  type?: 'mcq' | 'multiple_select' | 'numerical';
  options?: string[];
  correctAnswer?: number | number[] | null;
  explanation?: string;
}

export interface QuizPlayerProps {
  questions: QuizQuestion[];
  title?: string;
  initialAnswers?: (number | number[] | null)[];
  onSubmit: (data: { answers: (number | number[] | null)[]; timeTaken: number }) => void;
  showTimer?: boolean;
  duration?: number;
  showPalette?: boolean;
  allowReviewMarking?: boolean;
}

export default function QuizPlayer({
  questions,
  title = 'Quiz',
  initialAnswers = [],
  onSubmit,
  showTimer = false,
  duration = 0,
  showPalette = true,
}: QuizPlayerProps) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | number[] | null)[]>(
    initialAnswers.length > 0 ? initialAnswers : new Array(questions.length).fill(null)
  );
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    if (!quizStarted || !showTimer || timeRemaining <= 0) return;
    const t = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [quizStarted, showTimer, timeRemaining]);

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - sessionStartTime) / 1000);
    onSubmit({ answers, timeTaken });
  };

  const handleAnswer = (value: number) => {
    const next = [...answers];
    next[currentIndex] = value;
    setAnswers(next);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const q = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No questions.</Text>
      </View>
    );
  }

  if (!quizStarted) {
    return (
      <View style={styles.instruction}>
        <Text style={styles.instTitle}>{title}</Text>
        <Text style={styles.instMeta}>{questions.length} questions</Text>
        {showTimer && duration > 0 && <Text style={styles.instMeta}>Time: {formatTime(duration)}</Text>}
        <Pressable style={styles.startBtn} onPress={() => setQuizStarted(true)}>
          <Text style={styles.startBtnText}>Start</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
          {showTimer && <Text style={[styles.timer, timeRemaining < 60 && styles.timerLow]}>{formatTime(timeRemaining)}</Text>}
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{q?.question}</Text>
        </View>
        {q?.options?.map((opt, i) => (
          <Pressable
            key={i}
            style={[styles.option, answers[currentIndex] === i && styles.optionSelected]}
            onPress={() => handleAnswer(i)}
          >
            <View style={styles.optionLetter}>
              <Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text>
            </View>
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {showPalette && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette}>
            {questions.map((_, i) => (
              <Pressable
                key={i}
                style={[
                  styles.paletteDot,
                  i === currentIndex && styles.paletteDotActive,
                  answers[i] !== null && styles.paletteDotAnswered,
                ]}
                onPress={() => setCurrentIndex(i)}
              >
                <Text style={styles.paletteNum}>{i + 1}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.actions}>
          <Pressable style={styles.prevBtn} onPress={() => setCurrentIndex((p) => Math.max(0, p - 1))} disabled={currentIndex === 0}>
            <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? colors.mutedForeground : colors.foreground} />
            <Text style={[styles.prevBtnText, currentIndex === 0 && styles.disabledText]}>Previous</Text>
          </Pressable>
          {currentIndex < questions.length - 1 ? (
            <Pressable style={styles.nextBtn} onPress={() => setCurrentIndex((p) => p + 1)}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </Pressable>
          ) : (
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.mutedForeground },
  instruction: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  instTitle: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  instMeta: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
  startBtn: { marginTop: 32, backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  header: { padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.foreground },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  progressText: { fontSize: 14, color: colors.mutedForeground },
  timer: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  timerLow: { color: colors.destructive },
  progressBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  questionCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  questionText: { fontSize: 18, fontWeight: '600', color: colors.foreground },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card },
  optionSelected: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.08)' },
  optionLetter: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetterText: { fontWeight: '700', color: colors.foreground },
  optionText: { flex: 1, fontWeight: '500', color: colors.foreground },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  palette: { marginBottom: 16, maxHeight: 44 },
  paletteDot: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  paletteDotActive: { borderWidth: 2, borderColor: colors.primary },
  paletteDotAnswered: { backgroundColor: 'rgba(99,102,241,0.2)' },
  paletteNum: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 16 },
  prevBtnText: { fontWeight: '600', color: colors.foreground },
  disabledText: { color: colors.mutedForeground },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12 },
  nextBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  submitBtn: { flex: 1, backgroundColor: colors.success, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
