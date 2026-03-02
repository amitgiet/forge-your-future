import { ChevronLeft, ChevronRight, Lock, ExternalLink, Loader } from 'lucide-react';
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
      
      console.log('PYQ API Response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        
        setSubjects({
          physics: {
            name: 'Physics',
            topics: data.physics || []
          },
          chemistry: {
            name: 'Chemistry',
            topics: data.chemistry || []
          },
          biology: {
            name: 'Botany',
            topics: data.biology?.botany || []
          },
          zoology: {
            name: 'Zoology',
            topics: data.biology?.zoology || []
          }
        });
        
        console.log('Subjects set:', {
          physicsCount: data.physics?.length || 0,
          chemistryCount: data.chemistry?.length || 0,
          botanyCount: data.biology?.botany?.length || 0,
          zoologyCount: data.biology?.zoology?.length || 0
        });
        
        // Set initial subject
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
    // Navigate to topic viewer
    console.log('Topic clicked:', topicId);
    if (topicId && topicId.trim()) {
      navigate(`/pyq-marked-ncert/${topicId}`);
    } else {
      console.warn('Invalid topic ID:', topicId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse" />
        <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative z-10 text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PYQ Marked NCERT materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse" />
      <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="nf-heading text-2xl nf-gradient-text tracking-tighter flex-1">
            PYQ Marked NCERT
          </h1>
        </motion.div>

        {/* Subject Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        >
          {subjectOrder
            .filter((subject) => (subjects[subject]?.topics?.length || 0) > 0)
            .map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex-1 ${
                  activeSubject === subject
                    ? 'nf-btn-primary text-primary-foreground scale-75'
                    : 'glass-card-sm text-muted-foreground hover:text-foreground'
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
            className="glass-card p-4 mb-6 rounded-2xl border border-destructive/50 bg-destructive/10"
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
            className="space-y-3"
          >
            {currentSubjectData.topics.map((topic, index) => (
              <motion.button
                key={topic._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTopicClick(topic._id)}
                disabled={!topic.isAvailable}
                className={`w-full py-4 px-4 rounded-2xl flex items-center justify-between transition-all ${
                  !topic.isAvailable
                    ? 'bg-muted/30 cursor-not-allowed'
                    : 'glass-card hover:bg-accent/20 cursor-pointer active:scale-95'
                }`}
              >
                <span className={`text-foreground font-medium ${!topic.isAvailable ? 'text-muted-foreground' : ''}`}>
                  {topic.topicName}
                </span>
                {!topic.isAvailable ? (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/20">
                    <Lock className="w-4 h-4 text-destructive" />
                  </div>
                ) : (
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center rounded-2xl"
          >
            <p className="text-muted-foreground mb-2">No topics available</p>
            <p className="text-sm text-muted-foreground">Please select another subject</p>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card mt-6 p-4 rounded-2xl"
        >
          <p className="text-sm text-muted-foreground">
            <strong>📖 Note:</strong> Click on any topic to view the PYQ marked NCERT material directly in the app. You can also open in a new tab using the button on the top right (desktop).
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PYQMarkedNCERT;
