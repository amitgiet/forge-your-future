import { ChevronLeft, Loader, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '@/lib/apiService';
import { API_BASE_URL } from '@/lib/api';

interface Topic {
  _id: string;
  topicName: string;
  url: string;
  subject: string;
  stream?: string;
}

const optimizeHtmlForMobile = (html: string): string => {
  const patch = `
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style id="pyq-mobile-patch">
html, body {
  max-width: 100% !important;
  overflow-x: hidden !important;
}
body {
  margin: 0 auto !important;
  padding: 8px 10px !important;
  box-sizing: border-box !important;
  word-break: break-word !important;
}
img, table, pre, iframe, video, svg, canvas {
  max-width: 100% !important;
  height: auto !important;
}
table {
  display: block !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
}
</style>
<script>
(function () {
  function fitToMobileWidth() {
    var d = document.documentElement;
    var b = document.body;
    if (!b) return;
    b.style.zoom = '1';
    var contentWidth = Math.max(d.scrollWidth || 0, b.scrollWidth || 0);
    var viewportWidth = window.innerWidth || d.clientWidth || 360;
    var scale = contentWidth > viewportWidth ? Math.max(0.55, viewportWidth / contentWidth) : 1;
    b.style.zoom = String(scale);
  }
  window.addEventListener('load', fitToMobileWidth);
  window.addEventListener('resize', fitToMobileWidth);
  setTimeout(fitToMobileWidth, 0);
  setTimeout(fitToMobileWidth, 300);
})();
</script>`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${patch}`);
  }
  return `<head>${patch}</head>${html}`;
};

const PYQTopicViewer = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeHtml, setIframeHtml] = useState<string | null>(null);

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
    setIframeError(null);
  };

  const proxiedUrl = useMemo(() => {
    if (!topic?.url) return '';
    const sourceUrl = String(topic.url || '').trim();
    return `${API_BASE_URL}/api/v1/pyq-marked-ncert/html-proxy?url=${encodeURIComponent(sourceUrl)}`;
  }, [topic?.url]);

  useEffect(() => {
    if (!proxiedUrl) return;
    let cancelled = false;

    const loadIframeHtml = async () => {
      try {
        setIframeLoaded(false);
        setIframeError(null);
        setIframeHtml(null);
        const response = await fetch(proxiedUrl, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Proxy load failed (${response.status})`);
        }
        const html = await response.text();
        if (!cancelled) setIframeHtml(optimizeHtmlForMobile(html));
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading proxied PYQ HTML:', err);
          setIframeError('Could not load this content inside app. Please open it in a new tab.');
          setIframeLoaded(true);
        }
      }
    };

    loadIframeHtml();
    return () => {
      cancelled = true;
    };
  }, [proxiedUrl]);

  const handleIframeError = () => {
    setIframeLoaded(true);
    setIframeError('Could not load this content inside app. Please open it in a new tab.');
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
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse fixed" />
      <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse fixed" style={{ animationDelay: '1.5s' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 sticky top-0 backdrop-blur-xl bg-background/80 border-b border-border/20"
      >
        <div className="nf-safe-area px-3 py-2 sm:px-4 sm:py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 min-h-12">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="nf-heading text-base sm:text-lg nf-gradient-text tracking-tight truncate">
                {topic.topicName}
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize truncate">
                {topic.subject} {topic.stream ? `| ${topic.stream}` : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 px-0 sm:px-3 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full overflow-x-hidden"
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

          {iframeError && (
            <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {iframeError}
            </div>
          )}

          {/* IFrame to load HTML content - Direct, no card styling */}
          <iframe
            src={iframeHtml ? undefined : proxiedUrl}
            srcDoc={iframeHtml || undefined}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="block w-full border-0 overflow-hidden"
            style={{
              minHeight: 'calc(100dvh - 64px)',
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
          onClick={() => window.open(proxiedUrl, '_blank')}
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
