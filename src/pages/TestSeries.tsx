import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock, ExternalLink,
  FileText, Filter, Layers, Loader2, Search, SlidersHorizontal, Trophy, X, Zap
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import apiService from '../lib/apiService';

type ClassCategory = 'all' | '11' | '12' | 'dropper' | 'mixed' | 'other';
type TypeFilter = 'all' | 'part-test' | 'full-test' | 'fulllength-test';
type CoachingFilter = 'all' | 'self' | 'local' | 'national' | 'unknown';

type MockItem = {
  _id: string;
  testId: string;
  title?: { en?: string; hi?: string };
  description?: { en?: string; hi?: string };
  config: { duration: number; totalQuestions: number };
  accessType: 'FREE' | 'PRO' | 'ULTIMATE';
  classCategory?: ClassCategory;
  seriesType?: string;
  source?: { originalTestType?: string; testFor?: string[] };
  testType?: string;
  tags?: string[];
  resources?: {
    questionPdf?: string;
    answerPdf?: string;
    hindiQuestionPdf?: string;
    hindiAnswerPdf?: string;
  };
  progress?: { completed: boolean; completedAt: string | null };
  testSeriesDetails?: {
    subjectIds?: string[];
    chapterIds?: string[];
    topicIds?: string[];
  };
};

const classLabel: Record<ClassCategory, string> = {
  all: 'All Classes', '11': 'Class 11', '12': 'Class 12',
  dropper: 'Dropper', mixed: '11 + 12', other: 'Other',
};

const typeLabel: Record<TypeFilter, string> = {
  all: 'All Types', 'part-test': 'Part Test', 'full-test': 'Full Test', 'fulllength-test': 'Full Length',
};

const coachingLabel: Record<CoachingFilter, string> = {
  all: 'All Modes', self: 'Self Study', local: 'Local Coaching', national: 'National Coaching', unknown: 'Unknown',
};

const typeIcons: Record<string, React.ReactNode> = {
  'part-test': <Layers className="w-5 h-5" />,
  'full-test': <BookOpen className="w-5 h-5" />,
  'fulllength-test': <Trophy className="w-5 h-5" />,
};

const getTestForTokens = (item: MockItem): string[] => {
  const fromSource = Array.isArray(item.source?.testFor) ? item.source!.testFor!.map((v) => String(v).toLowerCase()) : [];
  const fromTags = Array.isArray(item.tags)
    ? item.tags.map((t) => String(t).toLowerCase()).filter((t) => t.startsWith('for:')).map((t) => t.replace('for:', ''))
    : [];
  return [...new Set([...fromSource, ...fromTags])];
};

const getOriginalType = (item: MockItem): string => {
  const fromSource = String(item.source?.originalTestType || '').toLowerCase().trim();
  if (fromSource) return fromSource;
  const fromTestType = String(item.testType || '').toUpperCase().trim();
  if (fromTestType === 'CHAPTER_TEST') return 'part-test';
  if (fromTestType === 'FULL_TEST') return 'full-test';
  return '';
};

const inferClass = (item: MockItem): ClassCategory => {
  if (item.classCategory && item.classCategory !== 'all') return item.classCategory;
  const testFor = getTestForTokens(item);
  const has11 = testFor.includes('11');
  const has12 = testFor.includes('12');
  const hasDropper = testFor.includes('dropper');
  if (hasDropper) return 'dropper';
  if (has11 && has12) return 'mixed';
  if (has11) return '11';
  if (has12) return '12';
  return 'other';
};

const inferCoaching = (item: MockItem): CoachingFilter => {
  const id = String(item.testId || '').toLowerCase();
  const text = `${item.title?.en || ''} ${item.description?.en || ''}`.toLowerCase();
  if (id.includes('national') || text.includes('national')) return 'national';
  if (id.includes('local') || text.includes('local')) return 'local';
  if (id.includes('self') || text.includes('self')) return 'self';
  return 'unknown';
};

const getSeriesKey = (item: MockItem): string => {
  const explicit = String(item.seriesType || '').trim();
  if (explicit) return explicit;
  const id = String(item.testId || '').toUpperCase();
  if (!id) return 'OTHER';
  const btsYear = id.match(/^(BTS\d{4})_/);
  if (btsYear?.[1]) return btsYear[1];
  const prefUnderscore = id.match(/^([A-Z]+)_/);
  if (prefUnderscore?.[1]) return prefUnderscore[1];
  const prefAlpha = id.match(/^([A-Z]+)/);
  if (prefAlpha?.[1]) return prefAlpha[1];
  return 'OTHER';
};

const prettySeriesLabel = (series: string): string => {
  const raw = String(series || '').trim();
  if (!raw) return 'Other';
  const lowered = raw.toLowerCase();
  if (lowered === 'sigma') return 'Sigma';
  if (lowered.startsWith('yakeen')) return raw; // keep "yakeen 3.0 (hindi)" etc as-is

  const s = raw.toUpperCase();
  if (s === 'BPT') return 'Brahmastra Part Tests';
  if (s === 'BFLT') return 'Brahmastra FLT';
  if (s === 'DROPPER') return 'Dropper Series';
  if (s === 'BOOTCAMP') return 'Bootcamp Series';
  if (s === 'TEST') return 'Generic Tests';
  if (s === 'OTHER') return 'Other';
  return raw;
};

const seriesIcons: Record<string, React.ReactNode> = {
  BPT: <Zap className="w-5 h-5" />,
  BFLT: <Trophy className="w-5 h-5" />,
  DROPPER: <BookOpen className="w-5 h-5" />,
  BOOTCAMP: <Layers className="w-5 h-5" />,
};

// Keep seriesKey casing as-is because some series are stored as lowercase
// (e.g. "yakeen 3.0 (english)") and we need exact matches.
const normalizeSeriesParam = (value?: string) => String(value || '').trim();
const normalizeTypeParam = (value?: string) => String(value || '').trim().toLowerCase();

const TestSeries = () => {
  const navigate = useNavigate();
  const { seriesKey, typeKey } = useParams<{ seriesKey?: string; typeKey?: string }>();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockItem[]>([]);
  const [seriesCatalog, setSeriesCatalog] = useState<Array<{ seriesType: string; count: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassCategory>('all');
  const [selectedCoaching, setSelectedCoaching] = useState<CoachingFilter>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // New states for hierarchical filtering
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'curriculum'>('all');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  const activeSeries = normalizeSeriesParam(seriesKey);
  const activeType = normalizeTypeParam(typeKey) as TypeFilter;
  const pageLevel: 'series' | 'types' | 'tests' = activeSeries ? (activeType ? 'tests' : 'types') : 'series';

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeMainTab === 'curriculum' && pageLevel === 'series' && !selectedChapterId) {
        setTests([]);
        setSeriesCatalog([]);
        return;
      }

      const params = { page: 1, limit: 500 };
      let res;
      if (activeMainTab === 'curriculum' && selectedChapterId) {
        res = await apiService.testSeries.getTestsByChapter(selectedChapterId, params);
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setTests(items);
        setSeriesCatalog([]);
      } else if (activeSeries) {
        res = await apiService.testSeries.getTestsBySeriesType(activeSeries, params);
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setTests(items);
        setSeriesCatalog([]);
      } else {
        // All Series page: load lightweight grouped catalog only.
        const catalogRes = await apiService.testSeries.getSeriesCatalog();
        const rows = Array.isArray(catalogRes.data?.data) ? catalogRes.data.data : [];
        setSeriesCatalog(rows);
        setTests([]);
      }
    } catch (e) {
      console.error('Failed to load mock tests:', e);
      setError('Failed to load test series.');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      setLoadingHierarchy(true);
      const res = await apiService.testSeries.getHierarchySubjects();
      if (res.data?.success) {
        setSubjects(res.data.data);
        if (res.data.data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(res.data.data[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load subjects:', e);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const loadChapters = async (subId: string) => {
    try {
      setLoadingHierarchy(true);
      const res = await apiService.testSeries.getHierarchyChapters(subId);
      if (res.data?.success) {
        setChapters(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load chapters:', e);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadTests();
  }, [activeSeries, activeMainTab, selectedChapterId, pageLevel]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadChapters(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleSubjectToggle = (subjectId: string) => {
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
      setSelectedChapterId(null);
      setChapters([]);
      return;
    }
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(null);
  };

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapterId((prev) => (prev === chapterId ? null : chapterId));
  };

  const coachingCounts = useMemo(() => {
    const counts: Record<CoachingFilter, number> = { all: tests.length, self: 0, local: 0, national: 0, unknown: 0 };
    for (const t of tests) counts[inferCoaching(t)] += 1;
    return counts;
  }, [tests]);

  const catalogTotalTests = useMemo(
    () => seriesCatalog.reduce((sum, row) => sum + Number(row.count || 0), 0),
    [seriesCatalog]
  );

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tests.filter((t) => {
      const title = String(t.title?.en || t.title?.hi || '').toLowerCase();
      const desc = String(t.description?.en || t.description?.hi || '').toLowerCase();
      const id = String(t.testId || '').toLowerCase();
      const matchesText = !q || title.includes(q) || desc.includes(q) || id.includes(q);
      if (!matchesText) return false;
      if (selectedClass !== 'all' && inferClass(t) !== selectedClass) return false;
      if (selectedCoaching !== 'all' && inferCoaching(t) !== selectedCoaching) return false;
      if (showFreeOnly && t.accessType !== 'FREE') return false;
      if (showCompletedOnly && !t.progress?.completed) return false;

      return true;
    });
  }, [tests, search, selectedClass, selectedCoaching, showFreeOnly, showCompletedOnly]);

  const seriesCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of baseFiltered) { const s = getSeriesKey(t); counts[s] = (counts[s] || 0) + 1; }
    return counts;
  }, [baseFiltered]);

  const seriesOptions = useMemo(() => {
    if (activeMainTab === 'all' && pageLevel === 'series') {
      const q = search.trim().toLowerCase();
      return seriesCatalog
        .map((row) => [String(row.seriesType || ''), Number(row.count || 0)] as [string, number])
        .filter(([series, count]) => {
          if (!series && count <= 0) return false;
          if (!q) return true;
          const label = prettySeriesLabel(series).toLowerCase();
          return label.includes(q) || series.toLowerCase().includes(q);
        })
        .sort((a, b) => b[1] - a[1]);
    }

    return Object.entries(seriesCounts).sort((a, b) => b[1] - a[1]);
  }, [activeMainTab, pageLevel, search, seriesCatalog, seriesCounts]);

  const seriesMeta = useMemo(() => {
    const meta: Record<string, { classes: string; modes: string }> = {};
    const classOrder: ClassCategory[] = ['11', '12', 'dropper', 'mixed', 'other'];
    const modeOrder: CoachingFilter[] = ['self', 'local', 'national', 'unknown'];
    for (const [series] of seriesOptions) {
      const rows = baseFiltered.filter((t) => getSeriesKey(t) === series);
      const cls = classOrder.filter((c) => rows.some((r) => inferClass(r) === c));
      const md = modeOrder.filter((m) => rows.some((r) => inferCoaching(r) === m));
      meta[series] = {
        classes: cls.map((c) => classLabel[c]).join(' · ') || 'All Classes',
        modes: md.map((m) => coachingLabel[m]).join(' · ') || 'All Modes',
      };
    }
    return meta;
  }, [seriesOptions, baseFiltered]);

  const inSeries = useMemo(
    () => baseFiltered.filter((t) => !activeSeries || getSeriesKey(t) === activeSeries),
    [baseFiltered, activeSeries]
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of inSeries) { const tp = getOriginalType(t) || 'unknown'; counts[tp] = (counts[tp] || 0) + 1; }
    return counts;
  }, [inSeries]);

  const typeOptions = useMemo(() => Object.entries(typeCounts).sort((a, b) => b[1] - a[1]), [typeCounts]);

  const finalTests = useMemo(() => {
    if (!activeType) return inSeries;
    return inSeries.filter((t) => (getOriginalType(t) || 'unknown') === activeType);
  }, [inSeries, activeType]);

  const openPdf = (url?: string, title?: string) => {
    if (!url) return;
    navigate(`/tests/pdf-viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || 'Mock PDF')}`);
  };

  const toggleCompleted = async (item: MockItem) => {
    try {
      const nextCompleted = !Boolean(item.progress?.completed);
      await apiService.mocks.markMockCompleted(item._id, { completed: nextCompleted });
      setTests((prev) =>
        prev.map((t) =>
          t._id === item._id
            ? { ...t, progress: { completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null } }
            : t
        )
      );
    } catch (e) {
      console.error('Failed to update completion status:', e);
    }
  };

  const activeFilterCount = [selectedClass !== 'all', selectedCoaching !== 'all', showFreeOnly, showCompletedOnly].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {pageLevel !== 'series' && (
              <button
                onClick={() => pageLevel === 'tests' ? navigate(`/tests/${activeSeries}`) : navigate('/tests')}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground nf-heading truncate">
                {pageLevel === 'series'
                  ? '📝 Test Series'
                  : pageLevel === 'types'
                    ? prettySeriesLabel(activeSeries)
                    : typeLabel[activeType] || activeType}
              </h1>
              <p className="text-xs text-muted-foreground">
                {pageLevel === 'series'
                  ? `${activeMainTab === 'all' && seriesCatalog.length ? catalogTotalTests : tests.length} tests available`
                  : pageLevel === 'types'
                    ? `${inSeries.length} tests · Choose type`
                    : `${finalTests.length} tests`}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors relative ${showFilters ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-3">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Main Tab Switcher */}
        {pageLevel === 'series' && (
          <div className="flex p-1 bg-muted rounded-xl mb-4 border border-border/50">
            <button
              onClick={() => setActiveMainTab('all')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeMainTab === 'all' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              All Series
            </button>
            <button
              onClick={() => setActiveMainTab('curriculum')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeMainTab === 'curriculum' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              Chapter Series
            </button>
          </div>
        )}

        {/* Hierarchical Controls (only for curriculum tab) */}
        {activeMainTab === 'curriculum' && pageLevel === 'series' && (
          <div className="space-y-3 mb-5">
            {/* Subject tabs (old style) */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {subjects.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => handleSubjectToggle(sub._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedSubjectId === sub._id ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-card border border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Chapter drawer style list for selected subject */}
            {selectedSubjectId && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
                  Chapters
                </div>
                <div className="p-2 space-y-2">
                  {loadingHierarchy ? (
                    <div className="py-2 px-1 text-xs text-muted-foreground">Loading chapters...</div>
                  ) : chapters.length > 0 ? (
                    chapters.map((ch) => {
                      const chapterSelected = selectedChapterId === ch._id;
                      return (
                        <div key={ch._id} className="rounded-lg border border-border overflow-hidden">
                          <button
                            onClick={() => handleChapterToggle(ch._id)}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${chapterSelected ? 'bg-secondary text-secondary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
                          >
                            <span className="pr-2">{ch.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${chapterSelected ? 'rotate-90' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {chapterSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-border bg-muted/20"
                              >
                                <div className="p-2 space-y-2">
                                  {loading ? (
                                    <div className="py-2 px-1 text-xs text-muted-foreground">Loading series...</div>
                                  ) : seriesOptions.length === 0 ? (
                                    <div className="py-2 px-1 text-[10px] text-muted-foreground italic">No series for this chapter</div>
                                  ) : (
                                    seriesOptions.map(([series, count]) => (
                                      <button
                                        key={`${ch._id}-${series}`}
                                        onClick={() => navigate(`/tests/${encodeURIComponent(series)}`)}
                                        className="w-full rounded-lg border border-border bg-card p-3 text-left hover:border-primary/40 transition-all"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            {seriesIcons[series] || <FileText className="w-4 h-4" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{prettySeriesLabel(series)}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{seriesMeta[series]?.classes}</p>
                                          </div>
                                          <span className="text-[10px] text-primary font-semibold">{count} tests</span>
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-2 px-1 text-[10px] text-muted-foreground italic">No chapters found</div>
                  )}
                </div>
              </div>
            )}

            {selectedChapterId && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Results for chapter</span>
                <button
                  onClick={() => setSelectedChapterId(null)}
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Filters</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="h-9 rounded-lg border border-border bg-background px-2 text-xs focus:border-primary outline-none"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassCategory)}
                  >
                    {(Object.keys(classLabel) as ClassCategory[]).map((k) => (
                      <option key={k} value={k}>{classLabel[k]}</option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-border bg-background px-2 text-xs focus:border-primary outline-none"
                    value={selectedCoaching}
                    onChange={(e) => setSelectedCoaching(e.target.value as CoachingFilter)}
                  >
                    {(Object.keys(coachingLabel) as CoachingFilter[])
                      .filter((k) => k === 'all' || coachingCounts[k] > 0)
                      .map((k) => (
                        <option key={k} value={k}>{coachingLabel[k]}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={showFreeOnly} onChange={(e) => setShowFreeOnly(e.target.checked)} className="rounded border-border text-primary" />
                    <span className="text-muted-foreground">Free only</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={showCompletedOnly} onChange={(e) => setShowCompletedOnly(e.target.checked)} className="rounded border-border text-primary" />
                    <span className="text-muted-foreground">Completed</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Loading tests...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <button onClick={loadTests} className="mt-2 text-xs text-primary font-semibold">Retry</button>
          </div>
        )}

        {/* ========= SERIES LIST ========= */}
        {!loading && !error && pageLevel === 'series' && activeMainTab === 'all' && (
          <div className="space-y-2.5">

            {activeMainTab === 'all' && (
              /* ── Custom Test Generator entry point ── */
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/test/custom/create')}
                className="w-full rounded-xl border-2 border-primary/40 bg-primary/5 p-4 text-left hover:bg-primary/10 transition-all group"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Custom Test Generator</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pick any chapter & subtopics from 34K+ questions</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
              </motion.button>
            )}

            {activeMainTab === 'curriculum' && !selectedChapterId && (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a chapter to see series</p>
              </div>
            )}

            {(seriesOptions.length === 0 && (
              activeMainTab === 'all' || (activeMainTab === 'curriculum' && selectedChapterId)
            )) && (
                <div className="rounded-xl bg-card border border-border p-8 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeMainTab === 'curriculum' ? 'No series found for this chapter' : 'No series found'}
                  </p>
                </div>
              )}
            {seriesOptions.map(([series, count], idx) => (
              <motion.button
                key={series}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => navigate(`/tests/${encodeURIComponent(series)}`)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 transition-all group"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {seriesIcons[series] || <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{prettySeriesLabel(series)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{seriesMeta[series]?.classes}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
                        <FileText className="w-3 h-3" /> {count} tests
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        )}


        {/* ========= TYPE LIST ========= */}
        {!loading && !error && pageLevel === 'types' && (
          <div className="space-y-2.5">
            {typeOptions.length === 0 && (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No test types found</p>
              </div>
            )}
            {typeOptions.map(([tp, count], idx) => (
              <motion.button
                key={tp}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => navigate(`/tests/${encodeURIComponent(activeSeries)}/${encodeURIComponent(tp)}`)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 transition-all group"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                    {typeIcons[tp] || <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{typeLabel[tp as TypeFilter] || tp}</p>
                    <span className="text-xs text-muted-foreground">{count} tests available</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* ========= TEST CARDS ========= */}
        {!loading && !error && pageLevel === 'tests' && (
          <div className="space-y-3">
            {finalTests.length === 0 && (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tests found</p>
              </div>
            )}

            {finalTests.map((item, idx) => {
              const title = item.title?.en || item.title?.hi || item.testId;
              const desc = item.description?.en || item.description?.hi || '';
              const completed = Boolean(item.progress?.completed);
              const hasPdfs = item.resources?.questionPdf || item.resources?.answerPdf;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.025 }}
                  className={`rounded-xl border bg-card overflow-hidden transition-all ${completed ? 'border-success/30' : 'border-border'}`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${completed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {completed ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
                        {desc && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>}
                      </div>
                      {item.accessType === 'FREE' && (
                        <span className="nf-badge nf-badge-success text-[10px] py-0.5 px-2">FREE</span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {item.config?.duration || 0} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        {item.config?.totalQuestions || 0} Qs
                      </span>
                      <span className="text-xs text-muted-foreground">{classLabel[inferClass(item)]}</span>
                      {completed && (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border px-4 py-3 bg-muted/30">
                    {hasPdfs && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => openPdf(item.resources?.questionPdf, `${title} - Questions`)}
                          disabled={!item.resources?.questionPdf}
                          className="h-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Questions
                        </button>
                        <button
                          onClick={() => openPdf(item.resources?.answerPdf, `${title} - Solutions`)}
                          disabled={!item.resources?.answerPdf}
                          className="h-8 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Solutions
                        </button>
                      </div>
                    )}

                    {(item.resources?.hindiQuestionPdf || item.resources?.hindiAnswerPdf) && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => openPdf(item.resources?.hindiQuestionPdf, `${title} - Hindi Questions`)}
                          disabled={!item.resources?.hindiQuestionPdf}
                          className="h-7 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                        >
                          Hindi Qs
                        </button>
                        <button
                          onClick={() => openPdf(item.resources?.hindiAnswerPdf, `${title} - Hindi Solutions`)}
                          disabled={!item.resources?.hindiAnswerPdf}
                          className="h-7 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                        >
                          Hindi Ans
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompleted(item)}
                        className={`h-9 flex-1 rounded-xl text-xs font-semibold transition-all ${completed
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                          : 'text-primary-foreground hover:opacity-90'
                          }`}
                        style={!completed ? { background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' } : undefined}
                      >
                        {completed ? 'Undo Completion' : '✓ Mark Complete'}
                      </button>
                      <button
                        onClick={() => openPdf(item.resources?.questionPdf || item.resources?.answerPdf, `${title}`)}
                        className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                        title="Open PDF"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default TestSeries;

