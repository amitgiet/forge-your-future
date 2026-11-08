import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DiagramLightboxModalProps {
  visible: boolean;
  imageUrl: string;
  overlayUrl?: string;
  title?: string;
  onClose: () => void;
}

export const DiagramLightboxModal: React.FC<DiagramLightboxModalProps> = ({
  visible,
  imageUrl,
  overlayUrl,
  title = 'NCERT Diagram Inspector',
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [activeUrl, setActiveUrl] = useState<string>(imageUrl);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  useEffect(() => {
    setActiveUrl(imageUrl);
    setShowOverlay(false);
    setScale(1);
  }, [imageUrl, overlayUrl, visible]);

  // Handle escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.75));
  const resetZoom = () => setScale(1);

  const toggleLayer = useCallback(() => {
    if (!overlayUrl) return;
    setShowOverlay((prev) => {
      const next = !prev;
      setActiveUrl(next ? overlayUrl : imageUrl);
      return next;
    });
  }, [imageUrl, overlayUrl]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 h-16 px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NCERT Diagram
            </span>
            <h3 className="text-white font-medium text-sm sm:text-base max-w-md truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {overlayUrl && (
              <button
                onClick={toggleLayer}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  showOverlay
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title="Toggle between Question and Verified Solution diagram"
              >
                {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                <span>{showOverlay ? 'Labeled (Solution)' : 'Unlabeled (Test)'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Image Container */}
        <div className="relative w-full h-[78vh] flex items-center justify-center overflow-hidden">
          <motion.img
            key={activeUrl}
            src={activeUrl}
            alt={title}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            drag={scale > 1}
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale }}
            exit={{ opacity: 0 }}
          />
        </div>

        {/* Bottom Floating Toolbar */}
        <div className="absolute bottom-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-white shadow-2xl">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.75}
            className="p-2 hover:bg-white/10 disabled:opacity-30 rounded-full transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-xs font-mono font-semibold hover:bg-white/10 rounded-full transition-colors"
            title="Reset Zoom (0)"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            className="p-2 hover:bg-white/10 disabled:opacity-30 rounded-full transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Reset Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
