import { ChevronLeft, Loader, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '@/lib/apiService';

interface Topic {
  _id: string;
  topicName: string;
  url: string;
  subject: string;
  stream?: string;
}

const PYQTopicViewer = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const fetchTopicDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!topicId) {
        setError('Topic ID is missing');
        return;
      }

      const response = await apiService.pyqMarkedNCERT.getTopicById(topicId);
      
      if (response.data?.success && response.data?.data) {
        setTopic(response.data.data);
      } else {
        setError('Failed to load topic details');
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Failed to load topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse" />
        <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative z-10 text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse" />
        <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl border border-destructive/50 bg-destructive/10 text-center"
          >
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold mb-2">Error Loading Topic</p>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="nf-btn-primary text-primary-foreground px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-background">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse fixed" />
      <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse fixed" style={{ animationDelay: '1.5s' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 sticky top-0 backdrop-blur-xl bg-background/80 border-b border-border/20"
      >
        <div className="nf-safe-area p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-h-16 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="nf-heading text-xl nf-gradient-text tracking-tighter truncate">
                {topic.topicName}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {topic.subject} {topic.stream ? `• ${topic.stream}` : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full"
        >
          {/* Loading overlay for iframe */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-20">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading content...</p>
              </div>
            </div>
          )}

          {/* IFrame to load HTML content - Direct, no card styling */}
          <iframe
            src={topic.url}
            onLoad={handleIframeLoad}
            className="w-full border-0"
            style={{
              minHeight: '100vh',
              zoom: 0.8,
              transformOrigin: 'top left',
              width: '125%',
              marginLeft: '-2.5%',
            }}
            title={topic.topicName}
          />
        </motion.div>
      </div>

      {/* Floating action button on desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="hidden md:flex fixed bottom-8 right-8 z-40"
      >
        <button
          onClick={() => window.open(topic.url, '_blank')}
          className="p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          title="Open in new tab"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default PYQTopicViewer;
