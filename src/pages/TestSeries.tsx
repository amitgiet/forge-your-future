import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ExternalLink, FileText, Filter, FlaskConical, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import apiService from '../lib/apiService';

type ClassCategory = 'all' | '11' | '12' | 'dropper' | 'mixed' | 'other';
type TypeFilter = 'all' | 'part-test' | 'full-test' | 'fulllength-test';

type MockItem = {
  _id: string;
  testId: string;
  title?: { en?: string; hi?: string };
  description?: { en?: string; hi?: string };
  config: {
    duration: number;
    totalQuestions: number;
  };
  accessType: 'FREE' | 'PRO' | 'ULTIMATE';
  classCategory?: ClassCategory;
  source?: {
    originalTestType?: string;
    testFor?: string[];
  };
  resources?: {
    questionPdf?: string;
    answerPdf?: string;
    hindiQuestionPdf?: string;
    hindiAnswerPdf?: string;
  };
  progress?: {
    completed: boolean;
    completedAt: string | null;
  };
};

const typeLabel: Record<TypeFilter, string> = {
  all: 'All Types',
  'part-test': 'Part Test',
  'full-test': 'Full Test',
  'fulllength-test': 'Full Length',
};

const classLabel: Record<ClassCategory, string> = {
  all: 'All Classes',
  '11': 'Class 11',
  '12': 'Class 12',
  dropper: 'Dropper',
  mixed: '11 + 12',
  other: 'Other',
};

const TestSeries = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<ClassCategory>('all');
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

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

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const originalType = (t.source?.originalTestType || '').toLowerCase();
      if (selectedClass !== 'all' && t.classCategory !== selectedClass) return false;
      if (selectedType !== 'all' && originalType !== selectedType) return false;
      if (showFreeOnly && t.accessType !== 'FREE') return false;
      if (showCompletedOnly && !t.progress?.completed) return false;
      return true;
    });
  }, [tests, selectedClass, selectedType, showFreeOnly, showCompletedOnly]);

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
      console.error('Failed to update completion:', e);
      alert('Could not update completion status.');
    }
  };

  const openPdf = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-foreground">Mock Test Series</h1>
          <p className="text-sm text-muted-foreground">View PDFs and mark tests as completed.</p>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Filters</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as ClassCategory)}
            >
              {Object.keys(classLabel).map((k) => (
                <option key={k} value={k}>
                  {classLabel[k as ClassCategory]}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TypeFilter)}
            >
              {Object.keys(typeLabel).map((k) => (
                <option key={k} value={k}>
                  {typeLabel[k as TypeFilter]}
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

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No tests found for current filters.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const title = item.title?.en || item.title?.hi || item.testId;
              const desc = item.description?.en || item.description?.hi || '';
              const completed = Boolean(item.progress?.completed);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
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
                    <span className="inline-flex items-center gap-1">
                      <FlaskConical className="w-3 h-3" />
                      {classLabel[(item.classCategory as ClassCategory) || 'other']}
                    </span>
                    <span>{item.source?.originalTestType || '-'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => openPdf(item.resources?.questionPdf)}
                      disabled={!item.resources?.questionPdf}
                      className="h-9 rounded-lg border border-primary/30 bg-primary/10 text-xs font-semibold text-primary disabled:opacity-50"
                    >
                      Question PDF
                    </button>
                    <button
                      onClick={() => openPdf(item.resources?.answerPdf)}
                      disabled={!item.resources?.answerPdf}
                      className="h-9 rounded-lg border border-success/30 bg-success/10 text-xs font-semibold text-success disabled:opacity-50"
                    >
                      Solution PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => openPdf(item.resources?.hindiQuestionPdf)}
                      disabled={!item.resources?.hindiQuestionPdf}
                      className="h-8 rounded-lg border border-border bg-muted/40 text-[11px] font-medium text-foreground disabled:opacity-50"
                    >
                      Hindi Q PDF
                    </button>
                    <button
                      onClick={() => openPdf(item.resources?.hindiAnswerPdf)}
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
                      onClick={() => openPdf(item.resources?.questionPdf || item.resources?.answerPdf)}
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

