import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import EmptyResourceState from '@/components/toppers/EmptyResourceState';
import ResourceChapterHeader from '@/components/toppers/ResourceChapterHeader';
import ResourceChapterList from '@/components/toppers/ResourceChapterList';
import ResourceSubjectPicker from '@/components/toppers/ResourceSubjectPicker';
import ResourceTypeGrid from '@/components/toppers/ResourceTypeGrid';
import ResourceViewerModal from '@/components/toppers/ResourceViewerModal';
import type { ChapterResourceDetail, ResourceChapterSummary, ResourceTypeKey, Subject } from '@/components/toppers/types';
import { SUBJECT_META, getResourceStats, getResourceTiles } from '@/components/toppers/utils';
import CrosswordViewer from '@/components/toppers/viewers/CrosswordViewer';
import GridlockViewer from '@/components/toppers/viewers/GridlockViewer';
import MemeGalleryViewer from '@/components/toppers/viewers/MemeGalleryViewer';
import NotesViewer from '@/components/toppers/viewers/NotesViewer';
import PodcastViewer from '@/components/toppers/viewers/PodcastViewer';
import apiService from '@/lib/apiService';

const SUBJECTS: Subject[] = ['biology', 'chemistry', 'physics'];
const RESOURCE_KEYS: ResourceTypeKey[] = ['notes', 'podcasts', 'crosswords', 'memes', 'gridlocks'];
const BASE_PATH = '/app/toppers-essentials';

const parsePathState = (pathname: string) => {
  const parts = pathname
    .replace(/^\/app\/toppers-essentials\/?/, '')
    .split('/')
    .filter(Boolean);

  const subject = SUBJECTS.includes(parts[0] as Subject) ? (parts[0] as Subject) : null;
  const chapterSlug = subject && parts[1] ? decodeURIComponent(parts[1]) : null;
  const resourceType = chapterSlug && RESOURCE_KEYS.includes(parts[2] as ResourceTypeKey)
    ? (parts[2] as ResourceTypeKey)
    : null;

  return { subject, chapterSlug, resourceType };
};

export default function ToppersEssentials() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { subject: selectedSubject, chapterSlug: selectedChapterSlug, resourceType: activeResource } = useMemo(
    () => parsePathState(location.pathname),
    [location.pathname]
  );

  const [chapters, setChapters] = useState<ResourceChapterSummary[]>([]);
  const [chapterDetail, setChapterDetail] = useState<ChapterResourceDetail | null>(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingChapterDetail, setLoadingChapterDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChapter = useMemo(
    () => chapters.find((chapter) => chapter.slug === selectedChapterSlug) || null,
    [chapters, selectedChapterSlug]
  );
  const tiles = useMemo(() => getResourceTiles(chapterDetail), [chapterDetail]);
  const stats = useMemo(() => getResourceStats(chapterDetail), [chapterDetail]);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setChapterDetail(null);
      return;
    }

    const loadChapters = async () => {
      setLoadingChapters(true);
      setError(null);
      setChapterDetail(null);
      try {
        const res = await apiService.chapterResources.getChapters(selectedSubject);
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setChapters(data);
      } catch (err: any) {
        setChapters([]);
        setError(err?.response?.data?.error || 'Failed to load chapter resources.');
      } finally {
        setLoadingChapters(false);
      }
    };

    loadChapters();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || !selectedChapterSlug) {
      setChapterDetail(null);
      return;
    }

    const loadChapterDetail = async () => {
      setLoadingChapterDetail(true);
      setError(null);
      try {
        const res = await apiService.chapterResources.getChapterDetail(selectedSubject, selectedChapterSlug);
        setChapterDetail(res.data?.data || null);
      } catch (err: any) {
        setChapterDetail(null);
        setError(err?.response?.data?.error || 'Failed to load chapter details.');
      } finally {
        setLoadingChapterDetail(false);
      }
    };

    loadChapterDetail();
  }, [selectedSubject, selectedChapterSlug]);

  const crosswordIndex = (() => {
    const raw = Number(searchParams.get('item'));
    return Number.isInteger(raw) && raw > 0 ? raw - 1 : null;
  })();

  const memeSlideIndex = (() => {
    const raw = Number(searchParams.get('slide'));
    return Number.isInteger(raw) && raw > 0 ? raw - 1 : null;
  })();

  useEffect(() => {
    if (activeResource !== 'memes' || !chapterDetail) return;
    if (memeSlideIndex !== null) return;

    const chapterKey = (chapterDetail.memes || []).map((meme) => meme.uniqueId).join('|');
    const storageKey = `toppers_memes_last_slide:${chapterKey}`;
    const saved = Number(localStorage.getItem(storageKey));

    if (Number.isInteger(saved) && saved >= 0) {
      const next = new URLSearchParams(searchParams);
      next.set('slide', String(saved + 1));
      setSearchParams(next, { replace: true });
    }
  }, [activeResource, chapterDetail, memeSlideIndex, searchParams, setSearchParams]);

  const goBack = () => {
    if (activeResource) {
      navigate(`${BASE_PATH}/${selectedSubject}/${selectedChapterSlug}`);
      return;
    }
    if (selectedChapterSlug && selectedSubject) {
      navigate(`${BASE_PATH}/${selectedSubject}`);
      return;
    }
    if (selectedSubject) {
      navigate(BASE_PATH);
      return;
    }
    navigate(-1);
  };

  const navigateToSubject = (subject: Subject) => {
    navigate(`${BASE_PATH}/${subject}`);
  };

  const navigateToChapter = (chapter: ResourceChapterSummary) => {
    navigate(`${BASE_PATH}/${chapter.subject}/${encodeURIComponent(chapter.slug)}`);
  };

  const navigateToResource = (resourceKey: ResourceTypeKey) => {
    navigate(`${BASE_PATH}/${selectedSubject}/${selectedChapterSlug}/${resourceKey}`);
  };

  const updateResourceSearch = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const renderViewer = () => {
    if (!chapterDetail || !activeResource) return null;

    switch (activeResource) {
      case 'notes':
        return <NotesViewer notes={chapterDetail.notes} />;
      case 'podcasts':
        return <PodcastViewer podcasts={chapterDetail.podcasts || []} />;
      case 'crosswords':
        return (
          <CrosswordViewer
            crosswords={chapterDetail.crosswords || []}
            selectedIndex={crosswordIndex}
            onSelectIndex={(index) => updateResourceSearch({ item: String(index + 1) })}
            onBackToList={() => updateResourceSearch({ item: null })}
          />
        );
      case 'memes':
        return (
          <MemeGalleryViewer
            memes={chapterDetail.memes || []}
            currentIndex={memeSlideIndex}
            onChangeIndex={(index) => updateResourceSearch({ slide: String(index + 1) })}
          />
        );
      case 'gridlocks':
        return <GridlockViewer gridlocks={chapterDetail.gridlocks || []} />;
      default:
        return null;
    }
  };

  const pageTitle = selectedChapter
    ? chapterDetail?.chapterName || selectedChapter.chapterName
    : selectedSubject
      ? `${SUBJECT_META[selectedSubject].label} Chapters`
      : "Toppers' Essentials";

  const pageSubtitle = selectedChapter
    ? 'Notes & fun resources for this chapter'
    : selectedSubject
      ? 'Choose a chapter resource'
      : 'Select a subject to explore chapter resources';

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <div className="glow-orb glow-orb-primary w-[360px] h-[360px] -top-36 -right-24 animate-glow-pulse" />
      <div className="glow-orb glow-orb-secondary w-[280px] h-[280px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.6s' }} />

      <div className="nf-safe-area relative z-10 mx-auto max-w-md p-4">
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-accent/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-foreground">{pageTitle}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{pageSubtitle}</p>
          </div>
          <div className="rounded-2xl bg-warning/15 p-2 text-warning">
            <Crown className="h-5 w-5" />
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!selectedSubject ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ResourceSubjectPicker
              subjects={SUBJECTS}
              selectedSubject={selectedSubject}
              onSelect={navigateToSubject}
            />
          </motion.div>
        ) : !selectedChapter ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-3xl border border-border p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected Subject</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">{SUBJECT_META[selectedSubject].label}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Only chapter resources from the dedicated Toppers&apos; Essentials collection are shown here.</p>
            </div>
            <ResourceChapterList chapters={chapters} loading={loadingChapters} onSelect={navigateToChapter} />
          </motion.div>
        ) : loadingChapterDetail ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chapterDetail ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <ResourceChapterHeader
              title={chapterDetail.chapterName}
              subtitle={`${SUBJECT_META[chapterDetail.subject].label} chapter`}
              categories={stats.categories}
              totalItems={stats.totalItems}
              onBack={() => navigate(`${BASE_PATH}/${selectedSubject}`)}
            />
            {tiles.length ? (
              <ResourceTypeGrid tiles={tiles} onSelect={navigateToResource} />
            ) : (
              <EmptyResourceState
                title="No chapter resources"
                description="This chapter exists in the resource collection but does not have usable Notes & Fun items yet."
              />
            )}
          </motion.div>
        ) : null}
      </div>

      <ResourceViewerModal
        open={Boolean(activeResource)}
        title={activeResource ? tiles.find((tile) => tile.key === activeResource)?.title || 'Resource' : 'Resource'}
        onBack={() => {
          if (activeResource === 'crosswords' && crosswordIndex !== null) {
            updateResourceSearch({ item: null });
            return;
          }
          navigate(`${BASE_PATH}/${selectedSubject}/${selectedChapterSlug}`);
        }}
        onClose={() => navigate(`${BASE_PATH}/${selectedSubject}/${selectedChapterSlug}`)}
        headerMode={activeResource === 'crosswords' && crosswordIndex !== null ? 'hidden' : 'default'}
      >
        {renderViewer()}
      </ResourceViewerModal>

      <BottomNav />
    </div>
  );
}
