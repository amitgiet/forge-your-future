import { ChevronLeft, Loader, AlertCircle, ExternalLink } from 'lucide-react';
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
  padding: 0 16px !important;
}
body {
  margin: 0 auto !important;
  padding: 8px 12px !important;
  box-sizing: border-box !important;
  word-break: break-word !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  line-height: 1.6 !important;
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
      if (!topicId) { setError('Topic ID is missing'); return; }
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

  const proxiedUrl = useMemo(() => {
    if (!topic?.url) return '';
    return `${API_BASE_URL}/api/v1/pyq-marked-ncert/html-proxy?url=${encodeURIComponent(String(topic.url).trim())}`;
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
        if (!response.ok) throw new Error(`Proxy load failed (${response.status})`);
        const html = await response.text();
        if (!cancelled) setIframeHtml(optimizeHtmlForMobile(html));
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading proxied PYQ HTML:', err);
          setIframeError('Could not load content. Please open in a new tab.');
          setIframeLoaded(true);
        }
      }
    };

    loadIframeHtml();
    return () => { cancelled = true; };
  }, [proxiedUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm max-w-sm w-full"
        >
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-foreground font-semibold mb-1">Error Loading Topic</p>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm"
      >
        <div className="px-3 py-2.5 max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">
              {topic.topicName}
            </h1>
            <p className="text-[11px] text-muted-foreground capitalize truncate">
              {topic.subject} {topic.stream ? `· ${topic.stream}` : ''}
            </p>
          </div>

          <a
            href={topic.url}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:border-primary/40 transition-colors flex-shrink-0"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 relative">
        {/* Loading overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading content...</p>
            </div>
          </div>
        )}

        {iframeError && (
          <div className="mx-3 mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {iframeError}
          </div>
        )}

        <iframe
          src={iframeHtml ? undefined : proxiedUrl}
          srcDoc={iframeHtml || undefined}
          onLoad={() => { setIframeLoaded(true); setIframeError(null); }}
          onError={() => { setIframeLoaded(true); setIframeError('Could not load content. Please open in a new tab.'); }}
          className="block w-full border-0"
          style={{ minHeight: 'calc(100dvh - 56px)' }}
          title={topic.topicName}
        />
      </div>
    </div>
  );
};

export default PYQTopicViewer;
