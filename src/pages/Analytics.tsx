import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, Target, Flame, BarChart3,
  BookOpen, FlaskConical, Zap, RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';

interface SubjectAccuracy {
  subject: string;
  correct: number;
  total: number;
  accuracy: number | null;
}

interface WeekDataPoint {
  week: string;
  label: string;
  correct: number;
  attempted: number;
  accuracy: number | null;
}

interface ChapterHeatmapItem {
  chapterId: string;
  subject: string;
  correct: number;
  total: number;
  accuracy: number | null;
}

const SUBJECT_CONFIG: Record<string, { label: string; emoji: string; Icon: React.FC<{ className?: string }> }> = {
  biology: { label: 'Biology', emoji: '🧬', Icon: BookOpen },
  chemistry: { label: 'Chemistry', emoji: '⚗️', Icon: FlaskConical },
  physics: { label: 'Physics', emoji: '⚛️', Icon: Zap },
};

const heatColor = (acc: number | null) => {
  if (acc === null) return 'bg-muted text-muted-foreground border-border';
  if (acc >= 80) return 'bg-primary/10 text-primary border-primary/20';
  if (acc >= 60) return 'bg-accent/10 text-accent-foreground border-accent/20';
  if (acc >= 40) return 'bg-muted text-foreground border-border';
  return 'bg-destructive/10 text-destructive border-destructive/20';
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function Analytics() {
  const navigate = useNavigate();

  const [subjectData, setSubjectData] = useState<{ overall: { correct: number; total: number; accuracy: number | null }; subjects: SubjectAccuracy[] } | null>(null);
  const [trendData, setTrendData] = useState<WeekDataPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<ChapterHeatmapItem[]>([]);
  const [heatSubject, setHeatSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for preview
  const MOCK_SUBJECT_DATA = {
    overall: { correct: 342, total: 480, accuracy: 71 },
    subjects: [
      { subject: 'biology', correct: 156, total: 200, accuracy: 78 },
      { subject: 'chemistry', correct: 108, total: 160, accuracy: 68 },
      { subject: 'physics', correct: 78, total: 120, accuracy: 65 },
    ],
  };

  const MOCK_TREND_DATA: WeekDataPoint[] = [
    { week: '2026-W01', label: 'Jan 5', correct: 18, attempted: 30, accuracy: 60 },
    { week: '2026-W02', label: 'Jan 12', correct: 22, attempted: 32, accuracy: 69 },
    { week: '2026-W03', label: 'Jan 19', correct: 20, attempted: 28, accuracy: 71 },
    { week: '2026-W04', label: 'Jan 26', correct: 25, attempted: 35, accuracy: 71 },
    { week: '2026-W05', label: 'Feb 2', correct: 28, attempted: 38, accuracy: 74 },
    { week: '2026-W06', label: 'Feb 9', correct: 24, attempted: 30, accuracy: 80 },
    { week: '2026-W07', label: 'Feb 16', correct: 30, attempted: 40, accuracy: 75 },
    { week: '2026-W08', label: 'Feb 23', correct: 32, attempted: 42, accuracy: 76 },
  ];

  const MOCK_HEATMAP_ALL: ChapterHeatmapItem[] = [
    { chapterId: 'Cell Division', subject: 'biology', correct: 8, total: 20, accuracy: 40 },
    { chapterId: 'Genetics & Evolution', subject: 'biology', correct: 12, total: 22, accuracy: 55 },
    { chapterId: 'Human Physiology', subject: 'biology', correct: 18, total: 30, accuracy: 60 },
    { chapterId: 'Plant Physiology', subject: 'biology', correct: 14, total: 20, accuracy: 70 },
    { chapterId: 'Ecology', subject: 'biology', correct: 16, total: 20, accuracy: 80 },
    { chapterId: 'Chemical Bonding', subject: 'chemistry', correct: 6, total: 18, accuracy: 33 },
    { chapterId: 'Organic Chemistry', subject: 'chemistry', correct: 10, total: 20, accuracy: 50 },
    { chapterId: 'Thermodynamics', subject: 'chemistry', correct: 14, total: 22, accuracy: 64 },
    { chapterId: 'Electrochemistry', subject: 'chemistry', correct: 12, total: 16, accuracy: 75 },
    { chapterId: 'Coordination Compounds', subject: 'chemistry', correct: 9, total: 14, accuracy: 64 },
    { chapterId: 'Mechanics', subject: 'physics', correct: 8, total: 20, accuracy: 40 },
    { chapterId: 'Electrostatics', subject: 'physics', correct: 10, total: 18, accuracy: 56 },
    { chapterId: 'Optics', subject: 'physics', correct: 12, total: 18, accuracy: 67 },
    { chapterId: 'Modern Physics', subject: 'physics', correct: 14, total: 20, accuracy: 70 },
    { chapterId: 'Magnetism', subject: 'physics', correct: 6, total: 14, accuracy: 43 },
  ];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, tRes, hRes] = await Promise.all([
        api.get('/analytics/subject-accuracy'),
        api.get('/analytics/accuracy-trend?weeks=8'),
        api.get(`/analytics/weakness-heatmap${heatSubject ? `?subject=${heatSubject}` : ''}`),
      ]);
      setSubjectData(sRes.data.data);
      setTrendData(tRes.data.data.weeks);
      setHeatmapData(hRes.data.data.chapters);
    } catch {
      // Fallback to mock data for preview
      setSubjectData(MOCK_SUBJECT_DATA);
      setTrendData(MOCK_TREND_DATA);
      const filtered = heatSubject
        ? MOCK_HEATMAP_ALL.filter((c) => c.subject === heatSubject)
        : MOCK_HEATMAP_ALL;
      setHeatmapData(filtered.sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100)));
    } finally {
      setLoading(false);
    }
  }, [heatSubject]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const maxAccuracy = Math.max(...trendData.map((d) => d.accuracy ?? 0), 1);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              My Analytics
            </h1>
            <p className="text-xs text-muted-foreground">Performance insights & weak areas</p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-sm text-destructive">{error}</div>
        )}

        {/* ── Overall Stats ─────────────────────────────────────────────── */}
        {subjectData?.overall?.total ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Overall Accuracy</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {subjectData.overall.accuracy ?? 0}
                  <span className="text-lg text-muted-foreground">%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-lg font-bold text-foreground">
                  <span className="text-primary">{subjectData.overall.correct}</span>
                  <span className="text-muted-foreground">/{subjectData.overall.total}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ── Subject Accuracy ──────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="bg-card border border-border rounded-2xl p-4">
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Subject Accuracy</h2>
          </motion.div>

          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              {(subjectData?.subjects || []).map((s) => {
                const cfg = SUBJECT_CONFIG[s.subject];
                const acc = s.accuracy ?? 0;
                return (
                  <motion.div key={s.subject} variants={fadeUp}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cfg?.emoji ?? '📚'}</span>
                        <span className="text-sm font-semibold text-foreground">{cfg?.label ?? s.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{acc}%</span>
                        <span className="text-xs text-muted-foreground">({s.correct}/{s.total})</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${acc}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
              {!subjectData?.overall?.total && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Complete some tests to see subject accuracy.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Accuracy Trend ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Weekly Trend</h2>
          </div>

          {loading ? (
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          ) : trendData.every((d) => d.accuracy === null) ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No test attempts in the last 8 weeks.</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {trendData.map((d, i) => {
                const pct = d.accuracy != null ? Math.round((d.accuracy / maxAccuracy) * 100) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {d.accuracy != null ? `${d.accuracy}%` : ''}
                    </span>
                    <motion.div
                      className={`w-full rounded-lg ${d.accuracy != null ? 'bg-primary' : 'bg-muted'}`}
                      style={{ minHeight: 4 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, pct)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      {d.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Weakness Heatmap ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-destructive" />
            <h2 className="font-bold text-foreground text-sm">Weak Chapters</h2>
          </div>

          {/* Subject filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {['', ...Object.keys(SUBJECT_CONFIG)].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setHeatSubject(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  heatSubject === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {s ? SUBJECT_CONFIG[s].label : 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : heatmapData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm">No chapter data yet.</p>
              <p className="text-xs">Complete tests to see your weaknesses.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {heatmapData.slice(0, 20).map((c, i) => {
                const cfg = SUBJECT_CONFIG[c.subject];
                return (
                  <motion.div
                    key={c.chapterId + i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl border ${heatColor(c.accuracy)}`}
                  >
                    <span className="text-base">{cfg?.emoji ?? '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{c.chapterId}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{c.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{c.accuracy != null ? `${c.accuracy}%` : '—'}</p>
                      <p className="text-[10px] text-muted-foreground">{c.correct}/{c.total}</p>
                    </div>
                  </motion.div>
                );
              })}
              {heatmapData.length > 20 && (
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Showing 20 weakest of {heatmapData.length} chapters
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
