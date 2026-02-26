import { useMemo } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';

const NCERTReader = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawUrl = searchParams.get('url') || '';
  const resourceType = (searchParams.get('type') || 'external') as 'pdf' | 'text' | 'html' | 'external';
  const title = searchParams.get('title') || 'NCERT Reader';
  const itemKey = searchParams.get('itemKey') || '';

  const proxyPdfUrl = useMemo(() => {
    if (!rawUrl) return '';
    return `${API_BASE_URL}/api/v1/ncert-search/pdf-proxy?url=${encodeURIComponent(rawUrl)}`;
  }, [rawUrl]);

  const handleMarkAsRead = () => {
    if (!itemKey) return;
    try {
      const raw = sessionStorage.getItem('ncert_read_map');
      const readMap = raw ? JSON.parse(raw) : {};
      readMap[itemKey] = {
        readAt: new Date().toISOString()
      };
      sessionStorage.setItem('ncert_read_map', JSON.stringify(readMap));
    } catch {
      // ignore storage errors
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="nf-safe-area p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="nf-heading text-xl text-foreground truncate">{title}</h1>
            <p className="text-xs text-muted-foreground">Full Reader</p>
          </div>
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-foreground hover:border-primary transition-colors"
              title="Open Source"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={handleMarkAsRead}
            disabled={!itemKey}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Read
          </button>
        </div>

        {!rawUrl ? (
          <div className="nf-card">
            <p className="text-muted-foreground">No document URL provided.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {resourceType === 'pdf' ? (
              <iframe
                src={proxyPdfUrl}
                title="NCERT Reader PDF"
                className="w-full h-[calc(100vh-140px)]"
              />
            ) : (
              <iframe
                src={rawUrl}
                title="NCERT Reader Content"
                className="w-full h-[calc(100vh-140px)]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NCERTReader;
