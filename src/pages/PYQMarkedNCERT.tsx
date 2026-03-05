import { ChevronLeft, ChevronRight, Lock, Loader, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';

interface Topic {
  _id?: string;
  topicName: string;
  url: string;
  isAvailable?: boolean;
}

interface SubjectData {
  name: string;
  topics: Topic[];
}

const subjectColors: Record<string, { bg: string; icon: string; accent: string }> = {
  physics: { bg: 'bg-primary/10', icon: 'text-primary', accent: 'border-primary/20' },
  chemistry: { bg: 'bg-success/10', icon: 'text-success', accent: 'border-success/20' },
  biology: { bg: 'bg-warning/10', icon: 'text-warning', accent: 'border-warning/20' },
  zoology: { bg: 'bg-secondary/10', icon: 'text-secondary', accent: 'border-secondary/20' },
};

const PYQMarkedNCERT = () => {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<string>('physics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Record<string, SubjectData>>({
    physics: { name: 'Physics', topics: [] },
    chemistry: { name: 'Chemistry', topics: [] },
    biology: { name: 'Biology', topics: [] },
  });

  useEffect(() => {
    fetchPYQData();
  }, []);

  const fetchPYQData = async () => {
    try {
      setLoading(true);
      const response = await apiService.pyqMarkedNCERT.getAllPYQData();
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setSubjects({
          physics: { name: 'Physics', topics: data.physics || [] },
          chemistry: { name: 'Chemistry', topics: data.chemistry || [] },
          biology: { name: 'Botany', topics: data.biology?.botany || [] },
          zoology: { name: 'Zoology', topics: data.biology?.zoology || [] },
        });
        if (data.physics && data.physics.length > 0) {
          setActiveSubject('physics');
        }
      }
    } catch (err) {
      console.error('Error fetching PYQ data:', err);
      setError('Failed to load PYQ data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subjectOrder = ['physics', 'chemistry', 'biology', 'zoology'];
  const currentSubjectData = subjects[activeSubject];
  const colors = subjectColors[activeSubject] || subjectColors.physics;
  const availableCount = currentSubjectData?.topics?.filter(t => t.isAvailable).length || 0;
  const totalCount = currentSubjectData?.topics?.length || 0;

  const handleTopicClick = (topicId: string | undefined) => {
    if (topicId && topicId.trim()) {
      navigate(`/pyq-marked-ncert/${topicId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading PYQ materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        {/* Sticky Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <BookOpen className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">PYQ Marked NCERT</h1>
                <p className="text-[11px] text-muted-foreground">Previous year questions highlighted</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-4">
          {/* Subject Tabs — pill style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide"
          >
            {subjectOrder
              .filter((s) => (subjects[s]?.topics?.length || 0) > 0)
              .map((subject) => {
                const isActive = activeSubject === subject;
                const sc = subjectColors[subject] || subjectColors.physics;
                return (
                  <button
                    key={subject}
                    onClick={() => setActiveSubject(subject)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : `bg-card ${sc.accent} text-muted-foreground hover:text-foreground`
                    }`}
                  >
                    {subjects[subject].name}
                  </button>
                );
              })}
          </motion.div>

          {/* Count Badge */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {availableCount} of {totalCount} available
              </span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 mb-4 rounded-xl border border-destructive/30 bg-destructive/5"
            >
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          {/* Topics List */}
          {currentSubjectData?.topics?.length > 0 ? (
            <motion.div
              key={activeSubject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              {currentSubjectData.topics.map((topic, index) => {
                const available = topic.isAvailable;
                return (
                  <motion.button
                    key={topic._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => available && handleTopicClick(topic._id)}
                    disabled={!available}
                    className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-all ${
                      !available
                        ? 'bg-muted/40 cursor-not-allowed opacity-60'
                        : 'bg-card border border-border hover:border-primary/30 active:scale-[0.98]'
                    }`}
                    style={available ? { boxShadow: 'var(--shadow-sm)' } : undefined}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !available ? 'bg-muted' : colors.bg
                    }`}>
                      {!available ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <BookOpen className={`w-4 h-4 ${colors.icon}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className={`text-sm font-medium block truncate ${
                        !available ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {topic.topicName}
                      </span>
                      {!available && (
                        <span className="text-[11px] text-muted-foreground">Coming soon</span>
                      )}
                    </div>
                    {available && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-10 text-center"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold mb-1">No topics available</p>
              <p className="text-sm text-muted-foreground">Please select another subject</p>
            </motion.div>
          )}

          {/* Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/15"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">📖 Tip:</strong> Tap any topic to view PYQ marked NCERT material directly in the app.
            </p>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PYQMarkedNCERT;
