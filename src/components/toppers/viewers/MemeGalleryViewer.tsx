import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Bookmark, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ContentItem } from '@/components/toppers/types';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import { getPageImageUrl, toDirectImageUrl } from '@/components/toppers/utils';

type MemeGalleryViewerProps = {
  memes: ContentItem[];
  currentIndex: number | null;
  onChangeIndex: (index: number) => void;
};

type MemeSlide = {
  id: string;
  src: string;
  memeIndex: number;
  pageIndex: number;
};

const SWIPE_THRESHOLD = 60;

export default function MemeGalleryViewer({ memes, currentIndex, onChangeIndex }: MemeGalleryViewerProps) {
  const [direction, setDirection] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const slides = useMemo<MemeSlide[]>(() => {
    return memes.flatMap((meme, memeIndex) => {
      const files = meme.files || [];
      const fallbackImage = meme.driveLink ? [toDirectImageUrl(meme.driveLink, meme.driveId || null)] : [];
      const images = files.length ? files.map(getPageImageUrl).filter(Boolean) : fallbackImage;

      return images.map((src, pageIndex) => ({
        id: `${meme.uniqueId}-${pageIndex}`,
        src,
        memeIndex,
        pageIndex,
      }));
    });
  }, [memes]);

  const storageKey = useMemo(() => {
    const chapterKey = memes.map((meme) => meme.uniqueId).join('|');
    return `toppers_memes_last_slide:${chapterKey}`;
  }, [memes]);

  useEffect(() => {
    if (!slides.length) return;
    const safeIndex = currentIndex !== null && Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex < slides.length
      ? currentIndex
      : 0;
    localStorage.setItem(storageKey, String(safeIndex));
  }, [currentIndex, slides.length, storageKey]);

  if (!memes.length) {
    return <EmptyResourceState title="Memes unavailable" description="No meme resources are available for this chapter." />;
  }

  if (!slides.length) {
    return <EmptyResourceState title="Memes unavailable" description="No meme images are available for this chapter." />;
  }

  const current = currentIndex !== null && Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex < slides.length
    ? currentIndex
    : 0;

  const goTo = (index: number, dir: number) => {
    if (index < 0 || index >= slides.length) return;
    setDirection(dir);
    onChangeIndex(index);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && current < slides.length - 1) {
      goTo(current + 1, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && current > 0) {
      goTo(current - 1, -1);
    }
  };

  const currentSlide = slides[current];
  const currentMemeNumber = currentSlide.memeIndex + 1;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Meme Viewer</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">Meme {currentMemeNumber}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {current + 1}/{slides.length} image{slides.length === 1 ? '' : 's'} • resumes from last visit
          </p>
        </div>
        <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
          <SheetTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] p-0 sm:w-[400px]">
            <div className="flex h-full flex-col bg-background">
              <SheetHeader className="border-b border-border p-4 pb-3 text-left">
                <SheetTitle className="text-base">Meme Palette</SheetTitle>
              </SheetHeader>
              <div className="border-b border-border px-4 py-3 text-xs text-muted-foreground">
                Jump directly to any meme by number.
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {slides.map((slide, index) => {
                    const isCurrent = index === current;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => {
                          goTo(index, index > current ? 1 : -1);
                          setPaletteOpen(false);
                        }}
                        className={`relative aspect-square rounded-lg border-2 text-xs font-bold transition-all ${
                          isCurrent
                            ? 'scale-105 border-primary bg-primary/15 text-primary ring-2 ring-primary/40'
                            : 'border-border bg-card text-foreground hover:scale-95 hover:bg-accent/10'
                        }`}
                      >
                        {index + 1}
                        {index === Number(localStorage.getItem(storageKey)) ? (
                          <Bookmark className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-warning text-warning" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-3">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="flex w-full cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <img
              src={currentSlide.src}
              alt={`Meme ${currentSlide.memeIndex + 1}`}
              className="max-h-[72vh] w-full rounded-2xl object-contain"
              loading="lazy"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {current > 0 ? (
          <button
            onClick={() => goTo(current - 1, -1)}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        {current < slides.length - 1 ? (
          <button
            onClick={() => goTo(current + 1, 1)}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {slides.length <= 15 ? (
          slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => goTo(index, index > current ? 1 : -1)}
              className={`h-2 rounded-full transition-all ${index === current ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
            />
          ))
        ) : (
          <div className="text-[10px] font-medium text-muted-foreground">Swipe left or right to browse all memes</div>
        )}
      </div>
    </div>
  );
}
