import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DiagramLightboxViewerProps {
  imageUrl: string | null | undefined;
  title?: string;
  thumbnailHeight?: number | string;
  className?: string;
}

export const DiagramLightboxViewer: React.FC<DiagramLightboxViewerProps> = ({
  imageUrl,
  title = 'Diagram Inspector',
  thumbnailHeight = 240,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  const resetTransforms = useCallback(() => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
    positionRef.current = { x: 0, y: 0 };
  }, []);

  const openModal = () => {
    resetTransforms();
    setIsOpen(true);
  };

  const closeModal = () => {
    resetTransforms();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
      else if (e.key === '0') resetTransforms();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, resetTransforms]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.35, 5.0));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev / 1.35, 1.0);
      if (next <= 1.0) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = () => {
    if (scale > 1.5) {
      resetTransforms();
    } else {
      setScale(2.5);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev * 1.15, 5.0));
    } else {
      setScale((prev) => {
        const next = Math.max(prev / 1.15, 1.0);
        if (next <= 1.0) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1.0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1.0) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPosition({ x: newX, y: newY });
    positionRef.current = { x: newX, y: newY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!imageUrl) return null;

  return (
    <div className={`w-full ${className}`.trim()}>
      {/* Thumbnail View */}
      <div
        onClick={openModal}
        className="w-full rounded-xl border border-border bg-card/60 hover:border-primary/50 relative overflow-hidden cursor-pointer group transition-all"
        style={{ maxHeight: thumbnailHeight }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full object-contain mx-auto"
          style={{ maxHeight: thumbnailHeight }}
          loading="lazy"
        />

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-sm shadow-md group-hover:bg-primary transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Tap to zoom & inspect</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col select-none"
            onMouseUp={handleMouseUp}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
              <h2 className="text-sm font-bold text-slate-100 truncate pr-4">
                {title}
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={zoomIn}
                  className="h-8 w-8 bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={zoomOut}
                  className="h-8 w-8 bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetTransforms}
                  className="h-8 w-8 bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  title="Reset Zoom (0)"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={closeModal}
                  className="h-8 w-8 bg-slate-900 border-slate-700 text-slate-200 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 ml-2"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div
              className={`flex-1 overflow-hidden flex items-center justify-center p-4 relative ${
                scale > 1.0 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              }`}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onDoubleClick={handleDoubleClick}
            >
              <div
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                }}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  draggable={false}
                  className="max-w-[90vw] max-h-[75vh] object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Footer Guide */}
            <div className="py-2.5 px-4 text-center border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex-shrink-0">
              Scroll wheel to zoom. Double-click to toggle 2.5x zoom. Drag to pan when zoomed. Press Esc to exit.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiagramLightboxViewer;
