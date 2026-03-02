import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, BookOpen, ChevronRight, FlaskConical, Atom, Leaf,
    Play, Layers, Hash, Loader2, AlertCircle, BookMarked, GraduationCap
} from 'lucide-react';
import apiService from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';

// ── Types ──────────────────────────────────────────────────────────────────
interface Chapter { _id: string; subject: string; order: number; isHidden: boolean; type?: string; }
interface SubTopic { subTopic: string; uid_count: number; hidden_uid_count: number; uids: number[]; hidden_uids: number[]; video?: string; notes?: string; }
interface TopicWithSubs { topic: string; sub_topics: SubTopic[]; }
interface TopicLite { topic: string; sub_topics: { subTopic: string }[]; }

type Subject = 'biology' | 'chemistry' | 'physics';
type Panel = 'subjects' | 'chapters' | 'topics' | 'subtopics';

const SUBJECT_META: Record<Subject, { label: string; icon: typeof Leaf; color: string; gradFrom: string; gradTo: string }> = {
    biology: { label: 'Biology', icon: Leaf, color: 'text-success', gradFrom: 'from-success/20', gradTo: 'to-success/5' },
    chemistry: { label: 'Chemistry', icon: FlaskConical, color: 'text-warning', gradFrom: 'from-warning/20', gradTo: 'to-warning/5' },
    physics: { label: 'Physics', icon: Atom, color: 'text-primary', gradFrom: 'from-primary/20', gradTo: 'to-primary/5' },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.32, ease: 'easeOut' as const } }),
};

// ── CurriculumBrowser ──────────────────────────────────────────────────────
const CurriculumBrowser = () => {
    const navigate = useNavigate();

    const [panel, setPanel] = useState<Panel>('subjects');
    const [subject, setSubject] = useState<Subject | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [topicsLite, setTopicsLite] = useState<TopicLite[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<TopicLite | null>(null);
    const [subTopics, setSubTopics] = useState<TopicWithSubs[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Fetch helpers ──────────────────────────────────────────────────────
    const loadChapters = async (sub: Subject) => {
        setLoading(true); setError(null);
        try {
            const res = await apiService.curriculum.getChapters(sub);
            setChapters((res.data?.data || []).filter((c: Chapter) => !c.isHidden));
        } catch {
            setError('Failed to load chapters. Please try again.');
        } finally { setLoading(false); }
    };

    const loadTopics = async (sub: Subject, chapterId: string) => {
        setLoading(true); setError(null);
        try {
            const res = await apiService.curriculum.getTopics(sub, chapterId);
            setTopicsLite(res.data?.data || []);
        } catch {
            setError('Failed to load topics.');
        } finally { setLoading(false); }
    };

    const loadSubTopics = async (sub: Subject, chapterId: string, topicName: string) => {
        setLoading(true); setError(null);
        try {
            const res = await apiService.curriculum.getSubTopics(sub, chapterId, topicName);
            setSubTopics(res.data?.data || []);
        } catch {
            setError('Failed to load sub-topics.');
        } finally { setLoading(false); }
    };

    // ── Navigation handlers ────────────────────────────────────────────────
    const selectSubject = (sub: Subject) => {
        setSubject(sub);
        setPanel('chapters');
        loadChapters(sub);
    };

    const selectChapter = (ch: Chapter) => {
        setSelectedChapter(ch);
        setPanel('topics');
        loadTopics(ch.subject as Subject, ch._id);
    };

    const selectTopic = (t: TopicLite) => {
        setSelectedTopic(t);
        setPanel('subtopics');
        if (selectedChapter && subject) {
            loadSubTopics(subject, selectedChapter._id, t.topic);
        }
    };

    const goBack = () => {
        setError(null);
        if (panel === 'subtopics') { setPanel('topics'); setSubTopics([]); }
        else if (panel === 'topics') { setPanel('chapters'); setTopicsLite([]); setSelectedChapter(null); }
        else if (panel === 'chapters') { setPanel('subjects'); setChapters([]); setSubject(null); }
        else navigate(-1);
    };

    const startQuiz = async (st: SubTopic, mode: 'practice' | 'test') => {
        if (!st.uids || st.uids.length === 0) return;
        setLoading(true);
        try {
            const res = await apiService.curriculum.getQuestionsByUIDs(st.uids, 1, st.uids.length);
            const rawQuestions = res.data?.data || [];
            if (rawQuestions.length === 0) {
                setError('No questions found for this sub-topic.');
                return;
            }
            navigate('/quiz-session', {
                state: {
                    mode,
                    questions: rawQuestions,
                    questionCount: rawQuestions.length,
                    topic: st.subTopic,
                    subject: subject || 'General',
                },
            });
        } catch {
            setError('Could not load questions. Please try again.');
        } finally { setLoading(false); }
    };

    // ── Breadcrumb ─────────────────────────────────────────────────────────
    const breadcrumb = () => {
        const parts: string[] = [];
        if (subject) parts.push(SUBJECT_META[subject].label);
        if (selectedChapter) parts.push(selectedChapter._id.length > 24 ? selectedChapter._id.slice(0, 22) + '…' : selectedChapter._id);
        if (selectedTopic) parts.push(selectedTopic.topic.length > 20 ? selectedTopic.topic.slice(0, 18) + '…' : selectedTopic.topic);
        return parts;
    };

    // ── Render states ──────────────────────────────────────────────────────
    const renderError = () => error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
        </div>
    );

    const renderLoader = () => (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    // ── Panels ─────────────────────────────────────────────────────────────

    const renderSubjects = () => (
        <motion.div initial="hidden" animate="show" className="space-y-4">
            {(Object.keys(SUBJECT_META) as Subject[]).map((sub, i) => {
                const meta = SUBJECT_META[sub];
                return (
                    <motion.button
                        key={sub}
                        custom={i}
                        variants={fadeUp}
                        onClick={() => selectSubject(sub)}
                        className={`w-full p-5 rounded-2xl bg-gradient-to-br ${meta.gradFrom} ${meta.gradTo} border border-border glass-card group text-left`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-background/60 ${meta.color} group-hover:scale-110 transition-transform`}>
                                <meta.icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-foreground">{meta.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Browse chapters & practice questions</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${meta.color} group-hover:translate-x-1 transition-transform`} />
                        </div>
                    </motion.button>
                );
            })}
        </motion.div>
    );

    const renderChapters = () => (
        <motion.div initial="hidden" animate="show" className="space-y-2">
            {chapters.map((ch, i) => (
                <motion.button
                    key={ch._id}
                    custom={i}
                    variants={fadeUp}
                    onClick={() => selectChapter(ch)}
                    className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        {i + 1}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-foreground">{ch._id}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.button>
            ))}
        </motion.div>
    );

    const renderTopics = () => (
        <motion.div initial="hidden" animate="show" className="space-y-2">
            {topicsLite.map((t, i) => (
                <motion.button
                    key={t.topic}
                    custom={i}
                    variants={fadeUp}
                    onClick={() => selectTopic(t)}
                    className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{t.topic}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.sub_topics.length} sub-topics</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.button>
            ))}
        </motion.div>
    );

    const renderSubTopics = () => (
        <motion.div initial="hidden" animate="show" className="space-y-3">
            {subTopics.flatMap((tw) =>
                tw.sub_topics
                    .filter((st) => st.uid_count > 0)
                    .map((st, i) => (
                        <motion.div
                            key={`${tw.topic}-${st.subTopic}`}
                            custom={i}
                            variants={fadeUp}
                            className="glass-card rounded-2xl border border-border p-4"
                        >
                            {/* Sub-topic header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <BookMarked className="w-4 h-4 text-success" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground leading-snug">{st.subTopic}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Hash className="w-3 h-3" />{st.uid_count} questions
                                        </span>
                                        {st.video && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Video</span>
                                        )}
                                        {st.notes && (
                                            <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full">Notes</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Practice / Test buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button
                                    onClick={() => startQuiz(st, 'practice')}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-semibold hover:bg-success/25 transition-colors disabled:opacity-50"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    Practice
                                </motion.button>
                                <motion.button
                                    onClick={() => startQuiz(st, 'test')}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Test Mode
                                </motion.button>
                            </div>
                        </motion.div>
                    ))
            )}
        </motion.div>
    );

    const panelTitle: Record<Panel, string> = {
        subjects: 'Question Bank',
        chapters: `${subject ? SUBJECT_META[subject].label : ''} Chapters`,
        topics: selectedChapter?._id || 'Topics',
        subtopics: selectedTopic?.topic || 'Sub-Topics',
    };

    return (
        <div className="min-h-screen pb-28 relative overflow-hidden">
            {/* Glow orbs */}
            <div className="glow-orb glow-orb-primary w-[350px] h-[350px] -top-32 -right-24 animate-glow-pulse" />
            <div className="glow-orb glow-orb-secondary w-[250px] h-[250px] bottom-40 -left-20 animate-glow-pulse" style={{ animationDelay: '2s' }} />

            <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <motion.button
                        onClick={goBack}
                        className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center flex-shrink-0"
                        whileTap={{ scale: 0.93 }}
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </motion.button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{panelTitle[panel]}</h1>
                        {/* Breadcrumb */}
                        {breadcrumb().length > 0 && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {breadcrumb().join(' › ')}
                            </p>
                        )}
                    </div>
                    {panel === 'subjects' && <BookOpen className="w-6 h-6 text-primary" />}
                </div>

                {/* Error */}
                {renderError()}

                {/* Content */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        renderLoader()
                    ) : (
                        <motion.div
                            key={panel}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.22 }}
                        >
                            {panel === 'subjects' && renderSubjects()}
                            {panel === 'chapters' && renderChapters()}
                            {panel === 'topics' && renderTopics()}
                            {panel === 'subtopics' && renderSubTopics()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav />
        </div>
    );
};

export default CurriculumBrowser;
