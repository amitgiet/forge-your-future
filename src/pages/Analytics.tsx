import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, TrendingUp, Target, Flame, BarChart3,
    BookOpen, FlaskConical, Zap, RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';

// ── Types ────────────────────────────────────────────────────────────────────
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

const SUBJECT_CONFIG: Record<string, { label: string; color: string; bar: string; Icon: React.FC<{ className?: string }> }> = {
    biology: { label: 'Biology', color: 'text-emerald-400', bar: 'bg-emerald-400', Icon: BookOpen },
    chemistry: { label: 'Chemistry', color: 'text-violet-400', bar: 'bg-violet-400', Icon: FlaskConical },
    physics: { label: 'Physics', color: 'text-sky-400', bar: 'bg-sky-400', Icon: Zap },
};

const heatColor = (acc: number | null) => {
    if (acc === null) return 'bg-muted text-muted-foreground';
    if (acc >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (acc >= 60) return 'bg-yellow-500/20  text-yellow-400  border-yellow-500/30';
    if (acc >= 40) return 'bg-orange-500/20  text-orange-400  border-orange-500/30';
    return 'bg-red-500/20     text-red-400     border-red-500/30';
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ── Component ────────────────────────────────────────────────────────────────
export default function Analytics() {
    const navigate = useNavigate();

    const [subjectData, setSubjectData] = useState<{ overall: { correct: number; total: number; accuracy: number | null }; subjects: SubjectAccuracy[] } | null>(null);
    const [trendData, setTrendData] = useState<WeekDataPoint[]>([]);
    const [heatmapData, setHeatmapData] = useState<ChapterHeatmapItem[]>([]);
    const [heatSubject, setHeatSubject] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError('Failed to load analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [heatSubject]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const maxAccuracy = Math.max(...trendData.map((d) => d.accuracy ?? 0), 1);

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold nf-heading">My Analytics</h1>
                        <p className="text-xs text-muted-foreground">Performance insights & weak areas</p>
                    </div>
                    <button onClick={fetchAll} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">{error}</div>
                )}

                {/* ── Subject Accuracy ──────────────────────────────────────────── */}
                <motion.div initial="hidden" animate="show" variants={stagger} className="bg-card border border-border rounded-2xl p-5">
                    <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-foreground">Subject Accuracy</h2>
                        {subjectData?.overall?.accuracy != null && (
                            <span className="ml-auto nf-badge nf-badge-primary">{subjectData.overall.accuracy}% overall</span>
                        )}
                    </motion.div>

                    {loading ? (
                        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}</div>
                    ) : (
                        <div className="space-y-4">
                            {(subjectData?.subjects || []).map((s) => {
                                const cfg = SUBJECT_CONFIG[s.subject];
                                const acc = s.accuracy;
                                return (
                                    <motion.div key={s.subject} variants={fadeUp}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                {cfg && <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />}
                                                <span className="text-sm font-semibold text-foreground">{cfg?.label ?? s.subject}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {acc != null ? <span className={`font-bold ${cfg?.color}`}>{acc}%</span> : <span>—</span>}
                                                <span className="text-xs ml-1">({s.correct}/{s.total})</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${cfg?.bar ?? 'bg-primary'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${acc ?? 0}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {!subjectData?.overall?.total && (
                                <p className="text-center text-sm text-muted-foreground py-4">Complete some tests to see subject accuracy.</p>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* ── Accuracy Trend ────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <h2 className="font-bold text-foreground">Weekly Accuracy Trend</h2>
                    </div>

                    {loading ? (
                        <div className="h-28 bg-muted rounded-xl animate-pulse" />
                    ) : trendData.every((d) => d.accuracy === null) ? (
                        <p className="text-center text-sm text-muted-foreground py-4">No test attempts in the last 8 weeks.</p>
                    ) : (
                        <div className="flex items-end gap-1.5 h-28">
                            {trendData.map((d, i) => {
                                const pct = d.accuracy != null ? Math.round((d.accuracy / maxAccuracy) * 100) : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[9px] text-muted-foreground">{d.accuracy != null ? `${d.accuracy}%` : ''}</span>
                                        <motion.div
                                            className={`w-full rounded-t-md ${d.accuracy != null ? 'bg-success' : 'bg-muted'} opacity-${d.accuracy != null ? '100' : '40'}`}
                                            style={{ minHeight: 4 }}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(4, pct)}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                        />
                                        <span className="text-[9px] text-muted-foreground rotate-0 leading-tight text-center">{d.label.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* ── Weakness Heatmap ──────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-5 h-5 text-destructive" />
                        <h2 className="font-bold text-foreground">Chapter Weakness Heatmap</h2>
                    </div>

                    {/* Subject filter */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        {['', ...Object.keys(SUBJECT_CONFIG)].map((s) => (
                            <button
                                key={s || 'all'}
                                onClick={() => setHeatSubject(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${heatSubject === s
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {s ? SUBJECT_CONFIG[s].label : 'All'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}</div>
                    ) : heatmapData.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            <BarChart3 className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No chapter data yet. Complete tests to see your weaknesses.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {heatmapData.slice(0, 20).map((c, i) => (
                                <motion.div
                                    key={c.chapterId + i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl border ${heatColor(c.accuracy)}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold truncate">{c.chapterId}</p>
                                        <p className="text-[10px] opacity-70 capitalize">{c.subject}</p>
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className="text-sm font-bold">{c.accuracy != null ? `${c.accuracy}%` : '—'}</p>
                                        <p className="text-[10px] opacity-70">{c.correct}/{c.total}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {heatmapData.length > 20 && (
                                <p className="text-center text-xs text-muted-foreground pt-1">Showing 20 weakest chapters of {heatmapData.length}</p>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
            <BottomNav />
        </div>
    );
}
