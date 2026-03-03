import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, ExternalLink, FileText, Filter, Loader2, Search } from 'lucide-react';
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
};

const classLabel: Record<ClassCategory, string> = {
  all: 'All Classes',
  '11': 'Class 11',
  '12': 'Class 12',
  dropper: 'Dropper',
  mixed: '11 + 12',
  other: 'Other',
};

const typeLabel: Record<TypeFilter, string> = {
  all: 'All Types',
  'part-test': 'Part Test',
  'full-test': 'Full Test',
  'fulllength-test': 'Full Length',
};

const coachingLabel: Record<CoachingFilter, string> = {
  all: 'All Modes',
  self: 'Self Study',
  local: 'Local Coaching',
  national: 'National Coaching',
  unknown: 'Unknown',
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
  const s = String(series || '').toUpperCase();
  if (s === 'BPT') return 'Brahmastra Part Tests (BPT)';
  if (s === 'BFLT') return 'Brahmastra FLT (BFLT)';
  if (s === 'DROPPER') return 'Dropper Series';
  if (s === 'BOOTCAMP') return 'Bootcamp Series';
  if (s === 'TEST') return 'Generic Tests';
  if (s === 'OTHER') return 'Other';
  return s;
};

const normalizeSeriesParam = (value?: string) => String(value || '').trim().toUpperCase();
const normalizeTypeParam = (value?: string) => String(value || '').trim().toLowerCase();

const TestSeries = () => {
  const navigate = useNavigate();
  const { seriesKey, typeKey } = useParams<{ seriesKey?: string; typeKey?: string }>();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassCategory>('all');
  const [selectedCoaching, setSelectedCoaching] = useState<CoachingFilter>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  const activeSeries = normalizeSeriesParam(seriesKey);
  const activeType = normalizeTypeParam(typeKey) as TypeFilter;
  const pageLevel: 'series' | 'types' | 'tests' = activeSeries ? (activeType ? 'tests' : 'types') : 'series';

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.mocks.getMockTests();
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setTests(items);
    } catch (e) {
      console.error('Failed to load mock tests:', e);
      setError('Failed to load test series.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const coachingCounts = useMemo(() => {
    const counts: Record<CoachingFilter, number> = { all: tests.length, self: 0, local: 0, national: 0, unknown: 0 };
    for (const t of tests) counts[inferCoaching(t)] += 1;
    return counts;
  }, [tests]);

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
    for (const t of baseFiltered) {
      const s = getSeriesKey(t);
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [baseFiltered]);

  const seriesOptions = useMemo(() => Object.entries(seriesCounts).sort((a, b) => b[1] - a[1]), [seriesCounts]);

  const seriesMeta = useMemo(() => {
    const meta: Record<string, { classes: string; modes: string }> = {};
    const classOrder: ClassCategory[] = ['11', '12', 'dropper', 'mixed', 'other'];
    const modeOrder: CoachingFilter[] = ['self', 'local', 'national', 'unknown'];
    for (const [series] of seriesOptions) {
      const rows = baseFiltered.filter((t) => getSeriesKey(t) === series);
      const cls = classOrder.filter((c) => rows.some((r) => inferClass(r) === c));
      const md = modeOrder.filter((m) => rows.some((r) => inferCoaching(r) === m));
      meta[series] = {
        classes: cls.map((c) => classLabel[c]).join(' | ') || 'All Classes',
        modes: md.map((m) => coachingLabel[m]).join(' | ') || 'All Modes',
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
    for (const t of inSeries) {
      const tp = getOriginalType(t) || 'unknown';
      counts[tp] = (counts[tp] || 0) + 1;
    }
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
            ? {
                ...t,
                progress: {
                  completed: nextCompleted,
                  completedAt: nextCompleted ? new Date().toISOString() : null,
                },
              }
            : t
        )
      );
    } catch (e) {
      console.error('Failed to update completion status:', e);
      alert('Could not update completion status.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        <div className="mb-4 flex items-center gap-2">
          {pageLevel !== 'series' && (
            <button
              onClick={() => {
                if (pageLevel === 'tests') navigate(`/tests/${activeSeries}`);
                else navigate('/tests');
              }}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-foreground">
              {pageLevel === 'series'
                ? 'Brahmastra Test Series'
                : pageLevel === 'types'
                  ? prettySeriesLabel(activeSeries)
                  : `${prettySeriesLabel(activeSeries)} - ${typeLabel[activeType] || activeType}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pageLevel === 'series'
                ? 'Search and choose a series'
                : pageLevel === 'types'
                  ? 'Choose test type'
                  : 'Choose a test'}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Search & Filters</p>
          </div>

          <div className="mb-2 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by test id/title (e.g. BPT_9)"
              className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as ClassCategory)}
            >
              {(Object.keys(classLabel) as ClassCategory[]).map((k) => (
                <option key={k} value={k}>
                  {classLabel[k]}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
              value={selectedCoaching}
              onChange={(e) => setSelectedCoaching(e.target.value as CoachingFilter)}
            >
              {(Object.keys(coachingLabel) as CoachingFilter[])
                .filter((k) => k === 'all' || coachingCounts[k] > 0)
                .map((k) => (
                  <option key={k} value={k}>
                    {coachingLabel[k]}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={showFreeOnly} onChange={(e) => setShowFreeOnly(e.target.checked)} />
              Free only
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={showCompletedOnly}
                onChange={(e) => setShowCompletedOnly(e.target.checked)}
              />
              Completed only
            </label>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && pageLevel === 'series' && (
          <div className="space-y-2">
            {seriesOptions.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground text-center">
                No series found for current filters.
              </div>
            )}
            {seriesOptions.map(([series, count]) => (
              <button
                key={series}
                onClick={() => navigate(`/tests/${encodeURIComponent(series)}`)}
                className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{prettySeriesLabel(series)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{seriesMeta[series]?.classes}</p>
                    <p className="text-[11px] text-muted-foreground">{seriesMeta[series]?.modes}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{count} tests</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && pageLevel === 'types' && (
          <div className="space-y-2">
            {typeOptions.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground text-center">
                No types found under this series.
              </div>
            )}
            {typeOptions.map(([tp, count]) => (
              <button
                key={tp}
                onClick={() => navigate(`/tests/${encodeURIComponent(activeSeries)}/${encodeURIComponent(tp)}`)}
                className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{typeLabel[tp as TypeFilter] || tp}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{count} tests</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && pageLevel === 'tests' && (
          <div className="space-y-3">
            {finalTests.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground text-center">
                No tests in this type for current filters.
              </div>
            )}

            {finalTests.map((item, idx) => {
              const title = item.title?.en || item.title?.hi || item.testId;
              const desc = item.description?.en || item.description?.hi || '';
              const completed = Boolean(item.progress?.completed);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{desc}</p>
                    </div>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Not Taken
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.config?.duration || 0} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.config?.totalQuestions || 0} questions
                    </span>
                    <span>{classLabel[inferClass(item)]}</span>
                    <span>{getOriginalType(item) || '-'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => openPdf(item.resources?.questionPdf, `${title} - Question PDF`)}
                      disabled={!item.resources?.questionPdf}
                      className="h-9 rounded-lg border border-primary/30 bg-primary/10 text-xs font-semibold text-primary disabled:opacity-50"
                    >
                      Question PDF
                    </button>
                    <button
                      onClick={() => openPdf(item.resources?.answerPdf, `${title} - Solution PDF`)}
                      disabled={!item.resources?.answerPdf}
                      className="h-9 rounded-lg border border-success/30 bg-success/10 text-xs font-semibold text-success disabled:opacity-50"
                    >
                      Solution PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => openPdf(item.resources?.hindiQuestionPdf, `${title} - Hindi Question PDF`)}
                      disabled={!item.resources?.hindiQuestionPdf}
                      className="h-8 rounded-lg border border-border bg-muted/40 text-[11px] font-medium text-foreground disabled:opacity-50"
                    >
                      Hindi Q PDF
                    </button>
                    <button
                      onClick={() => openPdf(item.resources?.hindiAnswerPdf, `${title} - Hindi Solution PDF`)}
                      disabled={!item.resources?.hindiAnswerPdf}
                      className="h-8 rounded-lg border border-border bg-muted/40 text-[11px] font-medium text-foreground disabled:opacity-50"
                    >
                      Hindi A PDF
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCompleted(item)}
                      className={`h-9 flex-1 rounded-lg text-xs font-semibold ${
                        completed
                          ? 'bg-muted text-muted-foreground border border-border'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {completed ? 'Mark Not Completed' : 'Mark Completed'}
                    </button>
                    <button
                      onClick={() => openPdf(item.resources?.questionPdf || item.resources?.answerPdf, `${title} - PDF`)}
                      className="h-9 w-10 rounded-lg border border-border flex items-center justify-center"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
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
