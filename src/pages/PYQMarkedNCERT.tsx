import { ChevronLeft, Lock, ExternalLink, Loader, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '@/lib/apiService';

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

  const handleTopicClick = (topicId: string | undefined) => {
    if (topicId && topicId.trim()) {
      navigate(`/pyq-marked-ncert/${topicId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading PYQ materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              PYQ Marked NCERT
            </h1>
          </div>
        </motion.div>

        {/* Subject Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide"
        >
          {subjectOrder
            .filter((subject) => (subjects[subject]?.topics?.length || 0) > 0)
            .map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeSubject === subject
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {subjects[subject].name}
              </button>
            ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 rounded-xl border border-destructive/30 bg-destructive/10"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Topics List */}
        {currentSubjectData?.topics?.length > 0 ? (
          <motion.div
            key={activeSubject}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2.5"
          >
            {currentSubjectData.topics.map((topic, index) => (
              <motion.button
                key={topic._id || index}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleTopicClick(topic._id)}
                disabled={!topic.isAvailable}
                className={`w-full py-3.5 px-4 rounded-xl flex items-center gap-3 transition-all ${
                  !topic.isAvailable
                    ? 'bg-muted/50 cursor-not-allowed'
                    : 'bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  !topic.isAvailable ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  {!topic.isAvailable ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <span className={`text-sm font-medium text-left flex-1 ${
                  !topic.isAvailable ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {topic.topicName}
                </span>
                {topic.isAvailable && (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
                )}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-8 text-center shadow-sm"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-1">No topics available</p>
            <p className="text-sm text-muted-foreground">Please select another subject</p>
          </motion.div>
        )}

        {/* Info Box */}
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
  );
};

export default PYQMarkedNCERT;
