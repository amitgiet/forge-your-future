import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const extractDriveFileId = (urlValue: string): string | null => {
  const url = String(urlValue || '').trim();
  if (!url) return null;

  const byQuery = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (byQuery?.[1]) return byQuery[1];

  const byPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (byPath?.[1]) return byPath[1];

  return null;
};

const toEmbedPdfUrl = (urlValue: string): string => {
  const raw = String(urlValue || '').trim();
  if (!raw) return raw;

  if (/drive\.google\.com|googleusercontent\.com/i.test(raw)) {
    const fileId = extractDriveFileId(raw);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  return raw;
};

const MockPdfViewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawUrl = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Mock PDF';
  const embedUrl = toEmbedPdfUrl(rawUrl);

  return (
    <div className="min-h-screen bg-background">
      <div className="nf-safe-area p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="nf-heading text-xl text-foreground truncate">{title}</h1>
            <p className="text-xs text-muted-foreground">In-App PDF Reader</p>
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
        </div>

        {!rawUrl ? (
          <div className="nf-card">
            <p className="text-muted-foreground">No PDF URL provided.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-[calc(100vh-140px)]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MockPdfViewer;
