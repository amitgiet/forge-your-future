import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Star, EyeOff, CheckCircle, Loader2, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import apiService from '@/lib/apiService';

const FILTER_TABS = [
  { key: 'all', label: 'All Formulae', icon: BookOpen, color: 'text-blue-500' },
  { key: 'revision', label: 'Need Revision', icon: Star, color: 'text-yellow-500' },
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'text-purple-500' },
  { key: 'unseen', label: 'Not Seen', icon: EyeOff, color: 'text-red-500' },
  { key: 'memorized', label: 'Memorized', icon: CheckCircle, color: 'text-green-500' },
];

const FormulaChapterDetail: React.FC = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const location = useLocation();
  const { subjectTitle, chapterTitle: stateTitle } = (location.state || {}) as any;

  const chapterTitle = stateTitle || decodeURIComponent(chapterId || '');

  const [topics, setTopics] = useState<any[]>([]);
  const [progressSummary, setProgressSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!chapterTitle) return;

      try {
        const [topicsRes, progRes] = await Promise.all([
          apiService.formulas.getTopics(chapterTitle),
          apiService.formulas.getChapterProgress(chapterTitle)
        ]);

        if (topicsRes.data?.success) {
          setTopics(topicsRes.data.data);
        }
        if (progRes.data?.success) {
          setProgressSummary(progRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load chapter data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterTitle]);

  const totalCards = topics.reduce((sum, t) => sum + (t.cardsCount || 0), 0);

  const openCardViewer = async (topicTitle: string) => {
    try {
      const res = await apiService.formulas.getCards(topicTitle);
      if (res.data?.success && res.data.data.length > 0) {
        navigate('/app/formula-cards/viewer', {
          state: {
            subjectTitle,
            chapterTitle,
            topicTitle,
            cards: res.data.data,
            startIndex: 0,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch cards for viewer:', error);
    }
  };

  // Compute stats per topic
  const topicStats = topics.reduce((acc, topic) => {
    const topicProgress = progressSummary.filter(p => p.topicTitle === topic.title);

    // Total tracked cards for this topic
    const trackedCount = topicProgress.length;
    // Total unseen = total default cards - tracked ones (plus ones explicitly marked as unseen if any)
    const unseenCount = (topic.cardsCount || 0) - trackedCount + topicProgress.filter(p => p.status === 'unseen').length;

    acc[topic._id] = {
      memorized: topicProgress.filter(p => p.status === 'memorized').length,
      revision: topicProgress.filter(p => p.status === 'need_revision').length,
      bookmarks: topicProgress.filter(p => p.isBookmarked).length,
      unseen: unseenCount,
    };
    return acc;
  }, {} as Record<string, any>);

  // Filter topics based on active tab
  const filteredTopics = topics.filter(topic => {
    if (activeFilter === 'all') return true;
    const stats = topicStats[topic._id];
    if (activeFilter === 'revision' && stats.revision > 0) return true;
    if (activeFilter === 'bookmarks' && stats.bookmarks > 0) return true;
    if (activeFilter === 'unseen' && stats.unseen > 0) return true;
    if (activeFilter === 'memorized' && stats.memorized > 0) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{chapterTitle}</h1>
          <p className="text-xs text-muted-foreground">{totalCards} Formula Cards</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${activeFilter === tab.key ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted'
              }`}
          >
            <tab.icon className={`w-5 h-5 ${tab.color}`} />
            <span className="text-[10px] text-muted-foreground leading-tight text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Topics heading */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="font-semibold text-foreground">Topics</h2>
        <span className="text-xs text-muted-foreground">{filteredTopics.length} Topics</span>
      </div>

      {/* Topic cards grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" />
            <p className="text-sm">Fetching topics...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="col-span-2 py-20 text-center text-muted-foreground">
            No topics match the selected filter.
          </div>
        ) : (
          filteredTopics.map((topic, idx) => {
            const stats = topicStats[topic._id];
            const percentMemorized = topic.cardsCount > 0 ? (stats.memorized / topic.cardsCount) * 100 : 0;

            return (
              <motion.button
                key={topic._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openCardViewer(topic.title)}
                className="rounded-2xl overflow-hidden bg-card border border-border text-left shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Preview image */}
                <div className="aspect-[4/3] overflow-hidden bg-muted relative shrink-0">
                  {topic.coverImage ? (
                    <img
                      src={topic.coverImage}
                      alt={topic.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <BookOpen className="w-8 h-8 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    {stats.revision > 0 && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-red-500/80 text-white border-0 backdrop-blur-sm">
                        {stats.revision}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-black/50 text-white border-0 backdrop-blur-sm">
                      {topic.cardsCount}
                    </Badge>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{topic.title}</h3>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                      <span>{stats.memorized} memorized</span>
                      <span>{Math.round(percentMemorized)}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${percentMemorized}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  );
};

export default FormulaChapterDetail;
