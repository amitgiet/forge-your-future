import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Atom,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  FlaskConical,
  GraduationCap,
  Hash,
  Leaf,
  Loader2,
  Play,
  Trophy,
} from 'lucide-react';
import apiService from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';

type Subject = 'biology' | 'chemistry' | 'physics';
type Panel = 'subjects' | 'chapters' | 'topics' | 'roadmap';

type Chapter = {
  _id: string;
  subject: Subject;
  order: number;
  isHidden: boolean;
  type?: string;
};

type SubTopicProgress = {
  hasTaken: boolean;
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttemptAt: string | null;
  completed: boolean;
};

type SubTopic = {
  subTopic: string;
  uid_count: number;
  hidden_uid_count: number;
  uids: number[];
  hidden_uids: number[];
  video?: string;
  notes?: string;
  progress?: SubTopicProgress;
  activeRun?: {
    runId: string;
    mode: 'practice' | 'test';
    attemptedQuestions: number;
    totalQuestions: number;
    lastActivityAt: string | null;
    expiresAt: string | null;
    resumeRemaining: number;
  } | null;
  activeRuns?: {
    practice: {
      runId: string;
      mode: 'practice';
      attemptedQuestions: number;
      totalQuestions: number;
      lastActivityAt: string | null;
      expiresAt: string | null;
      resumeRemaining: number;
    } | null;
    test: {
      runId: string;
      mode: 'test';
      attemptedQuestions: number;
      totalQuestions: number;
      lastActivityAt: string | null;
      expiresAt: string | null;
      resumeRemaining: number;
    } | null;
  };
};

type TopicWithSubs = {
  topic: string;
  sub_topics: SubTopic[];
};

type TopicLite = {
  topic: string;
  sub_topics: { subTopic: string }[];
};

type CurriculumRestoreState = {
  panel: Panel;
  subject: Subject | null;
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  topicsLite: TopicLite[];
  selectedTopic: string | null;
  topicFlows: TopicWithSubs[];
};

const SUBJECT_META: Record<Subject, { label: string; icon: typeof Leaf; color: string; gradFrom: string; gradTo: string }> = {
  biology: { label: 'Biology', icon: Leaf, color: 'text-success', gradFrom: 'from-success/20', gradTo: 'to-success/5' },
  chemistry: { label: 'Chemistry', icon: FlaskConical, color: 'text-warning', gradFrom: 'from-warning/20', gradTo: 'to-warning/5' },
  physics: { label: 'Physics', icon: Atom, color: 'text-primary', gradFrom: 'from-primary/20', gradTo: 'to-primary/5' },
};

const emptyProgress: SubTopicProgress = {
  hasTaken: false,
  attempts: 0,
  bestScore: 0,
  lastScore: 0,
  lastAttemptAt: null,
  completed: false,
};

const CurriculumBrowser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [panel, setPanel] = useState<Panel>('subjects');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [topicsLite, setTopicsLite] = useState<TopicLite[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicFlows, setTopicFlows] = useState<TopicWithSubs[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    if (hasRestored) return;
    const incoming = (location.state as { curriculumRestore?: CurriculumRestoreState } | null)?.curriculumRestore;
    if (!incoming) {
      setHasRestored(true);
      return;
    }

    setSubject(incoming.subject);
    setChapters(Array.isArray(incoming.chapters) ? incoming.chapters : []);
    setSelectedChapter(incoming.selectedChapter || null);
    setTopicsLite(Array.isArray(incoming.topicsLite) ? incoming.topicsLite : []);
    setSelectedTopic(incoming.selectedTopic || null);
    setTopicFlows(Array.isArray(incoming.topicFlows) ? incoming.topicFlows : []);
    setPanel(incoming.panel || 'subjects');
    setHasRestored(true);
  }, [hasRestored, location.state]);

  const loadChapters = async (sub: Subject) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.curriculum.getChapters(sub);
      setChapters((res.data?.data || []).filter((c: Chapter) => !c.isHidden));
    } catch {
      setError('Failed to load chapters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (sub: Subject, chapterId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.curriculum.getTopics(sub, chapterId);
      setTopicsLite(res.data?.data || []);
    } catch {
      setError('Failed to load topics.');
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmap = async (sub: Subject, chapterId: string, topicName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.curriculum.getSubTopics(sub, chapterId, topicName);
      setTopicFlows(res.data?.data || []);
    } catch {
      setError('Failed to load curriculum flow.');
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = (sub: Subject) => {
    setSubject(sub);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setTopicsLite([]);
    setTopicFlows([]);
    setPanel('chapters');
    loadChapters(sub);
  };

  const selectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedTopic(null);
    setTopicFlows([]);
    setPanel('topics');
    loadTopics(chapter.subject, chapter._id);
  };

  const selectTopic = (topicName: string) => {
    if (!selectedChapter || !subject) return;
    setSelectedTopic(topicName);
    setPanel('roadmap');
  };

  useEffect(() => {
    if (panel !== 'roadmap' || !subject || !selectedChapter || !selectedTopic) return;
    loadRoadmap(subject, selectedChapter._id, selectedTopic);
  }, [panel, subject, selectedChapter, selectedTopic]);

  const goBack = () => {
    setError(null);
    if (panel === 'roadmap') {
      setPanel('topics');
      setTopicFlows([]);
      setSelectedTopic(null);
      return;
    }
    if (panel === 'topics') {
      setPanel('chapters');
      setTopicsLite([]);
      setSelectedTopic(null);
      setSelectedChapter(null);
      return;
    }
    if (panel === 'chapters') {
      setPanel('subjects');
      setChapters([]);
      setTopicsLite([]);
      setSelectedChapter(null);
      setSelectedTopic(null);
      setTopicFlows([]);
      setSubject(null);
      return;
    }
    navigate(-1);
  };

  const startQuiz = async (topicName: string, subTopic: SubTopic, mode: 'practice' | 'test') => {
    if (!subject || !selectedChapter || !subTopic.uids || subTopic.uids.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const runRes = await apiService.curriculum.startRun({
        subject,
        chapterId: selectedChapter._id,
        topic: topicName,
        subTopic: subTopic.subTopic,
        mode,
        uids: subTopic.uids,
      });

      const rawQuestions = runRes.data?.data?.questions || [];
      const curriculumRun = runRes.data?.data?.run || null;
      if (rawQuestions.length === 0) {
        setError('No questions found for this sub-topic.');
        return;
      }

      const restoreState = {
        panel,
        subject,
        chapters,
        selectedChapter,
        topicsLite,
        selectedTopic,
        topicFlows,
      } as CurriculumRestoreState;

      const curriculumContext = {
        subject,
        chapterId: selectedChapter._id,
        topic: topicName,
        subTopic: subTopic.subTopic,
        uids: subTopic.uids,
        mode,
      };

      if (mode === 'test') {
        navigate('/test/custom-session', {
          state: {
            questions: rawQuestions,
            title: `${subTopic.subTopic} – Test`,
            duration: Math.max(Math.ceil(rawQuestions.length * 1.5), 5),
            subject,
            topic: subTopic.subTopic,
            curriculumRestore: restoreState,
            curriculumContext,
            curriculumRun,
          },
        });
      } else {
        navigate('/quiz-session', {
          state: {
            mode,
            questions: rawQuestions,
            questionCount: rawQuestions.length,
            topic: subTopic.subTopic,
            subject,
            curriculumRun,
            curriculumRestore: restoreState,
            curriculumContext,
          },
        });
      }
    } catch {
      setError('Could not load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chapterStats = useMemo(() => {
    const validSubTopics = topicFlows.flatMap((topic) =>
      topic.sub_topics.filter((sub) => sub.uid_count > 0)
    );

    const total = validSubTopics.length;
    const completed = validSubTopics.filter((sub) => (sub.progress || emptyProgress).completed).length;
    const bestScoreSum = validSubTopics.reduce(
      (sum, sub) => sum + Number((sub.progress || emptyProgress).bestScore || 0),
      0
    );
    const averageBest = total > 0 ? Math.round(bestScoreSum / total) : 0;

    return {
      total,
      completed,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageBest,
    };
  }, [topicFlows]);

  const getStatus = (progress?: SubTopicProgress, activeRun?: SubTopic['activeRun']) => {
    const resolved = progress || emptyProgress;
    if (resolved.completed) {
      return {
        label: 'Completed',
        chip: 'bg-success/15 text-success border-success/30',
        node: 'bg-success/20 border-success/40',
      };
    }
    if (resolved.hasTaken || Boolean(activeRun)) {
      return {
        label: 'In Progress',
        chip: 'bg-warning/15 text-warning border-warning/30',
        node: 'bg-warning/15 border-warning/40',
      };
    }
    return {
      label: 'Not Started',
      chip: 'bg-muted text-muted-foreground border-border',
      node: 'bg-card border-border',
    };
  };

  const panelTitle: Record<Panel, string> = {
    subjects: 'Question Bank',
    chapters: `${subject ? SUBJECT_META[subject].label : ''} Chapters`,
    topics: selectedChapter?._id || 'Topics',
    roadmap: selectedTopic || 'Curriculum Roadmap',
  };

  const breadcrumb = [
    subject ? SUBJECT_META[subject].label : null,
    selectedChapter ? selectedChapter._id : null,
    selectedTopic,
  ].filter(Boolean) as string[];

  const renderSubjects = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {(Object.keys(SUBJECT_META) as Subject[]).map((sub) => {
        const meta = SUBJECT_META[sub];
        return (
          <motion.button
            key={sub}
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
                <p className="text-xs text-muted-foreground mt-0.5">Browse chapters and track sub-topic mastery</p>
              </div>
              <ChevronRight className={`w-5 h-5 ${meta.color} group-hover:translate-x-1 transition-transform`} />
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );

  const renderChapters = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {chapters.map((chapter, index) => (
        <motion.button
          key={chapter._id}
          onClick={() => selectChapter(chapter)}
          className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <span className="flex-1 text-sm font-semibold text-foreground">{chapter._id}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </motion.div>
  );

  const renderTopics = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {topicsLite.map((topic, index) => (
        <motion.button
          key={topic.topic}
          onClick={() => selectTopic(topic.topic)}
          className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 text-warning font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{topic.topic}</p>
            <p className="text-xs text-muted-foreground">{topic.sub_topics?.length || 0} sub-topics</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </motion.div>
  );

  const renderRoadmap = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="glass-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Chapter Progress</p>
            <p className="text-lg font-bold text-foreground">{chapterStats.completed}/{chapterStats.total} sub-topics completed</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{chapterStats.completionPercent}% complete</p>
            <p className="text-xs text-muted-foreground">Avg best score: {chapterStats.averageBest}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${chapterStats.completionPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {topicFlows.map((topicFlow) => {
        const validSubs = topicFlow.sub_topics.filter((sub) => sub.uid_count > 0);
        const completed = validSubs.filter((sub) => (sub.progress || emptyProgress).completed).length;
        const avgBest = validSubs.length > 0
          ? Math.round(validSubs.reduce((sum, sub) => sum + Number((sub.progress || emptyProgress).bestScore || 0), 0) / validSubs.length)
          : 0;

        return (
          <div key={topicFlow.topic} className="glass-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-foreground">{topicFlow.topic}</p>
                <p className="text-xs text-muted-foreground">{completed}/{validSubs.length} completed</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="w-3.5 h-3.5" />
                Best Avg {avgBest}%
              </div>
            </div>

            <div className="space-y-3 relative">
              {validSubs.map((sub, index) => {
                const progress = sub.progress || emptyProgress;
                const status = getStatus(progress, sub.activeRun);
                const alignRight = index % 2 === 1;
                const practiceRun = sub.activeRuns?.practice || (sub.activeRun?.mode === 'practice' ? sub.activeRun : null);
                const testRun = sub.activeRuns?.test || (sub.activeRun?.mode === 'test' ? sub.activeRun : null);
                const hasPracticeResume = Boolean(practiceRun);
                const hasTestResume = Boolean(testRun);

                return (
                  <motion.div
                    key={`${topicFlow.topic}-${sub.subTopic}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="w-[92%]">
                      <div className={`rounded-2xl border p-3 ${status.node}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${status.node}`}>
                            {progress.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : progress.hasTaken ? (
                              <Trophy className="w-4 h-4 text-warning" />
                            ) : (
                              <CircleDashed className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground leading-snug">{sub.subTopic}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.chip}`}>{status.label}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{sub.uid_count} questions</span>
                              <span>Attempts: {progress.attempts}</span>
                              <span>Best: {progress.bestScore}%</span>
                              {progress.hasTaken && <span>Last: {progress.lastScore}%</span>}
                              {(testRun || practiceRun) && (
                                <span className="text-primary font-semibold">
                                  {testRun
                                    ? `Resume Test (${testRun.attemptedQuestions}/${testRun.totalQuestions})`
                                    : `Resume Practice (${practiceRun?.attemptedQuestions || 0}/${practiceRun?.totalQuestions || 0})`}
                                </span>
                              )}
                              {progress.lastAttemptAt && (
                                <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{new Date(progress.lastAttemptAt).toLocaleDateString()}</span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => startQuiz(topicFlow.topic, sub, 'practice')}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-semibold hover:bg-success/25 transition-colors disabled:opacity-50"
                              >
                                <Play className="w-3.5 h-3.5" />
                                {hasPracticeResume ? 'Resume' : 'Practice'}
                              </button>
                              <button
                                onClick={() => startQuiz(topicFlow.topic, sub, 'test')}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                {hasTestResume ? 'Resume Test' : 'Test'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {validSubs.length === 0 && (
                <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">
                  No active sub-topics with questions in this topic.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <div className="glow-orb glow-orb-primary w-[350px] h-[350px] -top-32 -right-24 animate-glow-pulse" />
      <div
        className="glow-orb glow-orb-secondary w-[250px] h-[250px] bottom-40 -left-20 animate-glow-pulse"
        style={{ animationDelay: '2s' }}
      />

      <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
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
            {breadcrumb.length > 0 && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{breadcrumb.join(' > ')}</p>
            )}
          </div>
          {panel === 'subjects' && <BookOpen className="w-6 h-6 text-primary" />}
          {panel === 'roadmap' && <BookMarked className="w-6 h-6 text-primary" />}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <motion.div
              key={panel}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {panel === 'subjects' && renderSubjects()}
              {panel === 'chapters' && renderChapters()}
              {panel === 'topics' && renderTopics()}
              {panel === 'roadmap' && renderRoadmap()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default CurriculumBrowser;
