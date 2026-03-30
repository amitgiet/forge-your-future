import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Atom,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  ExternalLink,
  FileText,
  FlaskConical,
  GraduationCap,
  Hash,
  Headphones,
  Info,
  ImageIcon,
  Leaf,
  Loader2,
  Map,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  X,
} from 'lucide-react';
import apiService from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';
import MindMapViewer from '@/components/MindMapViewer';

type Subject = 'biology' | 'chemistry' | 'physics';
type Panel = 'subjects' | 'chapters' | 'topics' | 'roadmap';

type Chapter = {
  _id: string;
  subject: Subject;
  order: number;
  isHidden: boolean;
  type?: string;
};

type SubTopicProgress = {
  hasTaken: boolean;
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttemptAt: string | null;
  completed: boolean;
};

type SubTopic = {
  subTopic: string;
  uid_count: number;
  hidden_uid_count: number;
  uids: number[];
  hidden_uids: number[];
  video?: string;
  notes?: string;
  progress?: SubTopicProgress;
  activeRun?: {
    runId: string;
    mode: 'practice' | 'test';
    attemptedQuestions: number;
    totalQuestions: number;
    lastActivityAt: string | null;
    expiresAt: string | null;
    resumeRemaining: number;
  } | null;
  activeRuns?: {
    practice: {
      runId: string;
      mode: 'practice';
      attemptedQuestions: number;
      totalQuestions: number;
      lastActivityAt: string | null;
      expiresAt: string | null;
      resumeRemaining: number;
    } | null;
    test: {
      runId: string;
      mode: 'test';
      attemptedQuestions: number;
      totalQuestions: number;
      lastActivityAt: string | null;
      expiresAt: string | null;
      resumeRemaining: number;
    } | null;
  };
};

type TopicWithSubs = {
  topic: string;
  sub_topics: SubTopic[];
};

type TopicLite = {
  topic: string;
  sub_topics: { subTopic: string }[];
};

type ToppersVideo = { title?: string | null; url?: string | null; time?: string | null };
type ToppersSlidesdeck = { title?: string | null; url?: string | null };
type ToppersEssentials = {
  video?: ToppersVideo | null;
  mindmap?: Record<string, unknown> | null;
  audio?: string | null;
  slidesdeck?: ToppersSlidesdeck | null;
  report?: string | null;
  flashcards?: string | null;
  infographic?: string | null;
};

type ResourceKey = 'video' | 'audio' | 'slides' | 'mindmap' | 'infographic' | 'report' | 'flashcards';

type CurriculumRestoreState = {
  panel: Panel;
  subject: Subject | null;
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  topicsLite: TopicLite[];
  selectedTopic: string | null;
  topicFlows: TopicWithSubs[];
};

type ResourceReactions = Record<string, { likes: number; dislikes: number; userReaction: 'like' | 'dislike' | 'none' }>;

const SUBJECT_META: Record<Subject, { label: string; icon: typeof Leaf; color: string; gradFrom: string; gradTo: string }> = {
  biology: { label: 'Biology', icon: Leaf, color: 'text-success', gradFrom: 'from-success/20', gradTo: 'to-success/5' },
  chemistry: { label: 'Chemistry', icon: FlaskConical, color: 'text-warning', gradFrom: 'from-warning/20', gradTo: 'to-warning/5' },
  physics: { label: 'Physics', icon: Atom, color: 'text-primary', gradFrom: 'from-primary/20', gradTo: 'to-primary/5' },
};

const emptyProgress: SubTopicProgress = {
  hasTaken: false,
  attempts: 0,
  bestScore: 0,
  lastScore: 0,
  lastAttemptAt: null,
  completed: false,
};

const TOPPER_RESOURCES: { key: ResourceKey; label: string; icon: typeof Play }[] = [
  { key: 'video', label: 'Video', icon: Play },
  { key: 'report', label: 'Quick Revision', icon: BarChart3 },
  { key: 'slides', label: 'Slides', icon: FileText },
  { key: 'audio', label: 'Podcast', icon: Headphones },
  { key: 'infographic', label: 'Infographic', icon: ImageIcon },
  { key: 'mindmap', label: 'Mind Map', icon: Map },
  { key: 'flashcards', label: 'Flashcards', icon: BookOpen },
];

const hasResource = (te: ToppersEssentials, key: ResourceKey): boolean => {
  if (key === 'video') return !!(te.video?.url);
  if (key === 'audio') return !!te.audio;
  if (key === 'slides') return !!(te.slidesdeck?.url);
  if (key === 'mindmap') return !!te.mindmap;
  if (key === 'infographic') return !!te.infographic;
  if (key === 'report') return !!te.report;
  if (key === 'flashcards') return !!te.flashcards;
  return false;
};

const hasAnyEssential = (te: ToppersEssentials): boolean =>
  TOPPER_RESOURCES.some((r) => hasResource(te, r.key));

const getYouTubeEmbedUrl = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
};

const extractDriveFileId = (urlValue: string): string | null => {
  const url = String(urlValue || '').trim();
  if (!url) return null;
  const byQuery = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (byQuery?.[1]) return byQuery[1];
  const byPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (byPath?.[1]) return byPath[1];
  return null;
};

const toEmbedDriveUrl = (urlValue: string): string => {
  const raw = String(urlValue || '').trim();
  if (!raw) return raw;
  // Catch all Google Drive / usercontent URLs
  if (/google\.com/i.test(raw)) {
    const fileId = extractDriveFileId(raw);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
    }
  }
  return raw;
};

const renderResourceContent = (
  key: ResourceKey,
  te: ToppersEssentials,
  chapterReactions: ResourceReactions,
  onToggleReaction: (rt: ResourceKey, r: 'like' | 'dislike') => void
) => {
  const reaction = chapterReactions[key] || { likes: 0, dislikes: 0, userReaction: 'none' };
  const toggleLike = () => onToggleReaction(key, 'like');
  const toggleDislike = () => onToggleReaction(key, 'dislike');

  if (key === 'video' && te.video?.url) {
    const ytEmbedUrl = getYouTubeEmbedUrl(te.video.url);
    const driveEmbedUrl = ytEmbedUrl ? null : toEmbedDriveUrl(te.video.url);
    const embedUrl = ytEmbedUrl || driveEmbedUrl;
    return (
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 0px)', background: '#1c1c1e' }}>
        <div className="w-full bg-black" style={{ aspectRatio: '16/9' }}>
          {embedUrl ? (
            <iframe src={embedUrl} className="w-full h-full" style={{ display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={te.video.title || 'Video'} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">No video available</div>
          )}
        </div>
        <div className="px-5 pt-5 pb-8 space-y-4">
          <div>
            <p className="text-lg font-bold text-white leading-snug">{te.video.title || 'Video Lecture'}</p>
            {te.video.time && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{te.video.time}</p>}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : 'rgba(255,255,255,0.4)' }}>
              <ThumbsUp className="w-6 h-6" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : 'rgba(255,255,255,0.4)' }}>
              <ThumbsDown className="w-6 h-6" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (key === 'audio' && te.audio) {
    const embedUrl = toEmbedDriveUrl(te.audio);
    return (
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 0px)', background: '#1c1c1e' }}>
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col justify-center items-center">
          <div className="w-full max-w-md h-32 relative rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10">
            <iframe src={embedUrl} className="w-full h-full border-0 absolute inset-0"
              allow="autoplay" title="Podcast" />
            {/* Mask to hide Google Drive pop-out button */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 backdrop-blur-sm z-10 pointer-events-none" />
          </div>
          <div className="mt-8 text-center px-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-500/20 mb-4">
              <Headphones className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Podcast Episode</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto">Listen to the chapter summary. Make sure to click play in the embed above.</p>
          </div>
        </div>
        <div className="px-5 pt-4 pb-8 border-t border-white/5 bg-black/50">
          <div className="flex items-center gap-6 justify-center">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : 'rgba(255,255,255,0.4)' }}>
              <ThumbsUp className="w-6 h-6" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : 'rgba(255,255,255,0.4)' }}>
              <ThumbsDown className="w-6 h-6" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (key === 'slides' && te.slidesdeck?.url) {
    const embedUrl = toEmbedDriveUrl(te.slidesdeck.url);
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="flex-1 relative bg-[#f5f0e8] overflow-hidden">
          <iframe
            src={embedUrl}
            title={te.slidesdeck.title || 'Slides'}
            className="w-full h-full border-0 absolute inset-0"
          />
          {/* Mask to hide Google Drive pop-out button */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#f5f0e8] z-10" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{te.slidesdeck.title || 'Slides'}</p>
            <p className="text-[10px] text-muted-foreground">Presentation</p>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : undefined }}>
              <ThumbsUp className="w-5 h-5" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : undefined }}>
              <ThumbsDown className="w-5 h-5" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (key === 'mindmap' && te.mindmap) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="flex-1 relative bg-background overflow-hidden">
          <MindMapViewer data={te.mindmap as any} />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Mind Map</p>
            <p className="text-[10px] text-muted-foreground">Visual summary</p>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : undefined }}>
              <ThumbsUp className="w-5 h-5" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : undefined }}>
              <ThumbsDown className="w-5 h-5" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (key === 'infographic' && te.infographic) {
    const embedUrl = toEmbedDriveUrl(te.infographic);
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="flex-1 relative bg-background overflow-hidden">
          <iframe src={embedUrl} title="Infographic" className="w-full h-full border-0 absolute inset-0" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-background z-10" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Infographic</p>
            <p className="text-[10px] text-muted-foreground">Chapter visual</p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : undefined }}>
              <ThumbsUp className="w-5 h-5" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : undefined }}>
              <ThumbsDown className="w-5 h-5" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (key === 'report' && te.report) {
    const embedUrl = toEmbedDriveUrl(te.report);
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="flex-1 relative bg-background overflow-hidden">
          <iframe src={embedUrl} title="Report" className="w-full h-full border-0 absolute inset-0" />
          {/* Mask to hide Google Drive pop-out button */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-background z-10" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Quick Revision</p>
            <p className="text-[10px] text-muted-foreground">Chapter Report</p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : undefined }}>
              <ThumbsUp className="w-5 h-5" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : undefined }}>
              <ThumbsDown className="w-5 h-5" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (key === 'flashcards' && te.flashcards) {
    const embedUrl = toEmbedDriveUrl(te.flashcards);
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="flex-1 relative bg-background overflow-hidden">
          <iframe src={embedUrl} title="Flashcards" className="w-full h-full border-0 absolute inset-0" />
          {/* Mask to hide Google Drive pop-out button */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-background z-10" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Flashcards</p>
            <p className="text-[10px] text-muted-foreground">Study cards</p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'like' ? '#6a7ef5' : undefined }}>
              <ThumbsUp className="w-5 h-5" fill={reaction.userReaction === 'like' ? '#6a7ef5' : 'none'} />
              <span className="text-sm font-semibold">{reaction.likes}</span>
            </button>
            <button onClick={toggleDislike} className="flex items-center gap-2 transition-transform hover:scale-105 text-muted-foreground" style={{ color: reaction.userReaction === 'dislike' ? '#fb7185' : undefined }}>
              <ThumbsDown className="w-5 h-5" fill={reaction.userReaction === 'dislike' ? '#fb7185' : 'none'} />
              <span className="text-sm font-semibold">{reaction.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <p className="text-sm text-muted-foreground">This resource is not available yet.</p>;
};

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };
  const seekBy = (s: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + s));
  };
  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  const wavePaused = !isPlaying ? 'paused' : '';

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d1e' }}>
      <style>{`
        @keyframes tc-wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .tc-w1 { animation: tc-wave 4s linear infinite; }
        .tc-w2 { animation: tc-wave 6.5s linear infinite reverse; }
        .tc-w3 { animation: tc-wave 5.2s linear infinite; }
        .tc-w1.paused, .tc-w2.paused, .tc-w3.paused { animation-play-state: paused; }
      `}</style>

      {/* Waveform */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        <div className="w-full h-24 relative overflow-hidden">
          {/* Wave 1 – indigo */}
          <div className={`tc-w1 ${wavePaused} absolute inset-0 w-[200%] flex`}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 300 64" preserveAspectRatio="none" className="w-1/2 h-full">
                <path d="M0,32 C15,12 30,52 45,32 C60,12 75,52 90,32 C105,12 120,52 135,32 C150,12 165,52 180,32 C195,12 210,52 225,32 C240,12 255,52 270,32 C285,12 300,52 315,32"
                  fill="none" stroke="#6a7ef5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ))}
          </div>
          {/* Wave 2 – green */}
          <div className={`tc-w2 ${wavePaused} absolute inset-0 w-[200%] flex`}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 300 64" preserveAspectRatio="none" className="w-1/2 h-full">
                <path d="M0,32 C20,6 40,58 60,32 C80,6 100,58 120,32 C140,6 160,58 180,32 C200,6 220,58 240,32 C260,6 280,58 300,32"
                  fill="none" stroke="#00c896" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ))}
          </div>
          {/* Wave 3 – light blue */}
          <div className={`tc-w3 ${wavePaused} absolute inset-0 w-[200%] flex opacity-50`}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 300 64" preserveAspectRatio="none" className="w-1/2 h-full">
                <path d="M0,32 C30,20 60,44 90,32 C120,20 150,44 180,32 C210,20 240,44 270,32 C300,20 330,44 315,32"
                  fill="none" stroke="#9bb0ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="relative w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}
          onClick={e => {
            const r = e.currentTarget.getBoundingClientRect();
            if (audioRef.current && duration) audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
          }}>
          <div className="h-full bg-primary rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        </div>
        <div className="flex justify-between mt-1" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
          <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-20 space-y-4">
        <div className="flex items-center justify-center gap-10">
          <button onClick={cycleRate} className="text-xs font-bold w-10 text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>{playbackRate}x</button>
          <div />
          <div /> {/* placeholders for missing thumb buttons in local audio layout */}
        </div>
        <div className="flex items-center justify-center gap-8">
          <button onClick={() => seekBy(-10)} className="flex flex-col items-center gap-0.5">
            <RotateCcw className="w-6 h-6 text-primary" />
            <span className="text-[9px] text-primary font-bold">10</span>
          </button>
          <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(var(--primary-rgb),0.4)' }}>
            {isPlaying ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
          </button>
          <button onClick={() => seekBy(10)} className="flex flex-col items-center gap-0.5">
            <RotateCw className="w-6 h-6 text-primary" />
            <span className="text-[9px] text-primary font-bold">10</span>
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)} />
    </div>
  );
};

const CurriculumBrowser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [panel, setPanel] = useState<Panel>('subjects');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [topicsLite, setTopicsLite] = useState<TopicLite[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicFlows, setTopicFlows] = useState<TopicWithSubs[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRestored, setHasRestored] = useState(false);
  const [toppersEssentials, setToppersEssentials] = useState<ToppersEssentials | null>(null);
  const [toppersOpen, setToppersOpen] = useState(false);
  const [toppersPreviewResource, setToppersPreviewResource] = useState<ResourceKey | null>(null);
  const [chapterReactions, setChapterReactions] = useState<ResourceReactions>({});
  const resourceOpenedAtRef = useRef<number | null>(null);

  // Log resource view when user navigates away from a resource
  const openResource = (key: ResourceKey) => {
    resourceOpenedAtRef.current = Date.now();
    setToppersPreviewResource(key);
  };

  const closeResource = () => {
    if (toppersPreviewResource && selectedChapter && resourceOpenedAtRef.current) {
      const durationSeconds = Math.round((Date.now() - resourceOpenedAtRef.current) / 1000);
      if (durationSeconds > 3) {
        apiService.curriculum.logResource({
          chapterId: selectedChapter._id,
          subject: subject || undefined,
          resourceType: toppersPreviewResource,
          durationSeconds,
        }).catch(() => { }); // fire-and-forget
      }
      resourceOpenedAtRef.current = null;
    }
    setToppersPreviewResource(null);
  };

  useEffect(() => {
    if (hasRestored) return;
    const incoming = (location.state as { curriculumRestore?: CurriculumRestoreState } | null)?.curriculumRestore;
    if (incoming) {
      setSubject(incoming.subject);
      setChapters(Array.isArray(incoming.chapters) ? incoming.chapters : []);
      setSelectedChapter(incoming.selectedChapter || null);
      setTopicsLite(Array.isArray(incoming.topicsLite) ? incoming.topicsLite : []);
      setSelectedTopic(incoming.selectedTopic || null);
      setTopicFlows(Array.isArray(incoming.topicFlows) ? incoming.topicFlows : []);
      setPanel(incoming.panel || 'subjects');
      setHasRestored(true);
      return;
    }

    // Try to restore from URL params instead
    const urlSubject = searchParams.get('s') as Subject | null;
    const urlChapterId = searchParams.get('c');
    const urlTopic = searchParams.get('t');
    const urlPanel = (searchParams.get('p') as Panel | null) || 'subjects';

    if (!urlSubject) {
      setHasRestored(true);
      return;
    }

    const restoreFromUrl = async () => {
      setLoading(true);
      setSubject(urlSubject);
      setPanel(urlPanel);
      try {
        if (urlPanel === 'chapters' || urlPanel === 'topics' || urlPanel === 'roadmap') {
          const chapRes = await apiService.curriculum.getChapters(urlSubject);
          const loadedChapters = (chapRes.data?.data || []).filter((c: Chapter) => !c.isHidden);
          setChapters(loadedChapters);

          if (urlChapterId) {
            const chap = loadedChapters.find((c: Chapter) => c._id === urlChapterId);
            if (chap) {
              setSelectedChapter(chap);
              if (urlPanel === 'topics' || urlPanel === 'roadmap') {
                const topicRes = await apiService.curriculum.getTopics(urlSubject, urlChapterId);
                setTopicsLite(topicRes.data?.data || []);
                setToppersEssentials(topicRes.data?.toppersEssentials || null);
                const reactionsRes = await apiService.curriculum.getResourceReactions(urlChapterId).catch(() => ({ data: { data: {} } }));
                setChapterReactions(reactionsRes.data?.data || {});

                if (urlTopic) {
                  setSelectedTopic(urlTopic);
                  if (urlPanel === 'roadmap') {
                    const roadRes = await apiService.curriculum.getSubTopics(urlSubject, urlChapterId, urlTopic);
                    setTopicFlows(roadRes.data?.data || []);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        setError('Failed to restore session. Redirecting to subjects.');
        setPanel('subjects');
      } finally {
        setLoading(false);
        setHasRestored(true);
      }
    };

    restoreFromUrl();
  }, [hasRestored, location.state, searchParams]);

  const loadChapters = async (sub: Subject) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.curriculum.getChapters(sub);
      setChapters((res.data?.data || []).filter((c: Chapter) => !c.isHidden));
    } catch {
      setError('Failed to load chapters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (sub: Subject, chapterId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [res, reactionsRes] = await Promise.all([
        apiService.curriculum.getTopics(sub, chapterId),
        apiService.curriculum.getResourceReactions(chapterId).catch(() => ({ data: { data: {} } }))
      ]);
      setTopicsLite(res.data?.data || []);
      setToppersEssentials(res.data?.toppersEssentials || null);
      setChapterReactions(reactionsRes.data?.data || {});
    } catch {
      setError('Failed to load topics.');
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmap = async (sub: Subject, chapterId: string, topicName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.curriculum.getSubTopics(sub, chapterId, topicName);
      setTopicFlows(res.data?.data || []);
    } catch {
      setError('Failed to load curriculum flow.');
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = (sub: Subject) => {
    setSubject(sub);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setTopicsLite([]);
    setTopicFlows([]);
    setPanel('chapters');
    setSearchParams({ s: sub, p: 'chapters' }, { replace: true });
    loadChapters(sub);
  };

  const selectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedTopic(null);
    setTopicFlows([]);
    setPanel('topics');
    if (subject) setSearchParams({ s: subject, c: chapter._id, p: 'topics' }, { replace: true });
    loadTopics(chapter.subject, chapter._id);
  };

  const selectTopic = (topicName: string) => {
    if (!selectedChapter || !subject) return;
    setSelectedTopic(topicName);
    setPanel('roadmap');
    setSearchParams({ s: subject, c: selectedChapter._id, t: topicName, p: 'roadmap' }, { replace: true });
  };

  const handleToggleReaction = async (resourceType: ResourceKey, reactionType: 'like' | 'dislike') => {
    if (!selectedChapter) return;

    // Optimistic update
    setChapterReactions(prev => {
      const current = prev[resourceType] || { likes: 0, dislikes: 0, userReaction: 'none' };
      const next = { ...current };

      if (current.userReaction === reactionType) {
        // Toggle off
        next.userReaction = 'none';
        if (reactionType === 'like') next.likes = Math.max(0, next.likes - 1);
        if (reactionType === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
      } else {
        // Toggle on (and potentially switch from the other)
        if (current.userReaction === 'like') next.likes = Math.max(0, next.likes - 1);
        if (current.userReaction === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
        
        next.userReaction = reactionType;
        if (reactionType === 'like') next.likes += 1;
        if (reactionType === 'dislike') next.dislikes += 1;
      }

      return { ...prev, [resourceType]: next };
    });

    try {
      const reaction = chapterReactions[resourceType]?.userReaction === reactionType ? 'none' : reactionType;
      await apiService.curriculum.toggleResourceReaction({
        chapterId: selectedChapter._id,
        resourceType,
        reaction
      });
    } catch (err) {
      // Background revert on failure (not strictly necessary but good practice)
      console.error('Failed to toggle reaction', err);
    }
  };

  useEffect(() => {
    if (panel !== 'roadmap' || !subject || !selectedChapter || !selectedTopic) return;
    loadRoadmap(subject, selectedChapter._id, selectedTopic);
  }, [panel, subject, selectedChapter, selectedTopic]);

  const goBack = () => {
    setError(null);
    if (panel === 'roadmap') {
      setPanel('topics');
      setTopicFlows([]);
      setSelectedTopic(null);
      if (subject && selectedChapter) setSearchParams({ s: subject, c: selectedChapter._id, p: 'topics' }, { replace: true });
      return;
    }
    if (panel === 'topics') {
      setPanel('chapters');
      setTopicsLite([]);
      setSelectedTopic(null);
      setSelectedChapter(null);
      if (subject) setSearchParams({ s: subject, p: 'chapters' }, { replace: true });
      return;
    }
    if (panel === 'chapters') {
      setPanel('subjects');
      setChapters([]);
      setTopicsLite([]);
      setSelectedChapter(null);
      setSelectedTopic(null);
      setTopicFlows([]);
      setSubject(null);
      setSearchParams({}, { replace: true });
      return;
    }
    navigate(-1);
  };

  const startQuiz = async (topicName: string, subTopic: SubTopic, mode: 'practice' | 'test') => {
    if (!subject || !selectedChapter || !subTopic.uids || subTopic.uids.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const runRes = await apiService.curriculum.startRun({
        subject,
        chapterId: selectedChapter._id,
        topic: topicName,
        subTopic: subTopic.subTopic,
        mode,
        uids: subTopic.uids,
      });

      const rawQuestions = runRes.data?.data?.questions || [];
      const curriculumRun = runRes.data?.data?.run || null;
      if (rawQuestions.length === 0) {
        setError('No questions found for this sub-topic.');
        return;
      }

      const restoreState = {
        panel,
        subject,
        chapters,
        selectedChapter,
        topicsLite,
        selectedTopic,
        topicFlows,
      } as CurriculumRestoreState;

      const curriculumContext = {
        subject,
        chapterId: selectedChapter._id,
        topic: topicName,
        subTopic: subTopic.subTopic,
        uids: subTopic.uids,
        mode,
      };

      if (mode === 'test') {
        navigate('/app/curriculum-quiz-instructions', {
          state: {
            questions: rawQuestions,
            title: `${subTopic.subTopic} – Test`,
            duration: Math.max(Math.ceil(rawQuestions.length * 1.5), 5),
            subject,
            topic: subTopic.subTopic,
            curriculumRestore: restoreState,
            curriculumContext,
            curriculumRun,
          },
        });
      } else {
        navigate('/app/curriculum-quiz-instructions', {
          state: {
            questions: rawQuestions,
            title: `${subTopic.subTopic} – Practice`,
            duration: Math.max(Math.ceil(rawQuestions.length * 3), 10),
            subject,
            topic: subTopic.subTopic,
            curriculumRestore: restoreState,
            curriculumContext,
            curriculumRun,
          },
        });
      }
    } catch {
      setError('Could not load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chapterStats = useMemo(() => {
    const validSubTopics = topicFlows.flatMap((topic) =>
      topic.sub_topics.filter((sub) => sub.uid_count > 0)
    );

    const total = validSubTopics.length;
    const completed = validSubTopics.filter((sub) => (sub.progress || emptyProgress).completed).length;
    const bestScoreSum = validSubTopics.reduce(
      (sum, sub) => sum + Number((sub.progress || emptyProgress).bestScore || 0),
      0
    );
    const averageBest = total > 0 ? Math.round(bestScoreSum / total) : 0;

    return {
      total,
      completed,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageBest,
    };
  }, [topicFlows]);

  const getStatus = (progress?: SubTopicProgress, activeRun?: SubTopic['activeRun']) => {
    const resolved = progress || emptyProgress;
    if (resolved.completed) {
      return {
        label: 'Completed',
        chip: 'bg-success/15 text-success border-success/30',
        node: 'bg-success/20 border-success/40',
      };
    }
    if (resolved.hasTaken || Boolean(activeRun)) {
      return {
        label: 'In Progress',
        chip: 'bg-warning/15 text-warning border-warning/30',
        node: 'bg-warning/15 border-warning/40',
      };
    }
    return {
      label: 'Not Started',
      chip: 'bg-muted text-muted-foreground border-border',
      node: 'bg-card border-border',
    };
  };

  const panelTitle: Record<Panel, string> = {
    subjects: 'Question Bank',
    chapters: `${subject ? SUBJECT_META[subject].label : ''} Chapters`,
    topics: selectedChapter?._id || 'Topics',
    roadmap: selectedTopic || 'Curriculum Roadmap',
  };

  const breadcrumb = [
    subject ? SUBJECT_META[subject].label : null,
    selectedChapter ? selectedChapter._id : null,
    selectedTopic,
  ].filter(Boolean) as string[];

  const renderSubjects = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {(Object.keys(SUBJECT_META) as Subject[]).map((sub) => {
        const meta = SUBJECT_META[sub];
        return (
          <motion.button
            key={sub}
            onClick={() => selectSubject(sub)}
            className={`w-full p-5 rounded-2xl bg-gradient-to-br ${meta.gradFrom} ${meta.gradTo} border border-border glass-card group text-left`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-background/60 ${meta.color} group-hover:scale-110 transition-transform`}>
                <meta.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">{meta.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Browse chapters and track sub-topic mastery</p>
              </div>
              <ChevronRight className={`w-5 h-5 ${meta.color} group-hover:translate-x-1 transition-transform`} />
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );

  const renderChapters = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {chapters.map((chapter, index) => (
        <motion.button
          key={chapter._id}
          onClick={() => selectChapter(chapter)}
          className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <span className="flex-1 text-sm font-semibold text-foreground">{chapter._id}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </motion.div>
  );

  const renderTopics = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {false && toppersEssentials && hasAnyEssential(toppersEssentials) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setToppersOpen(true)}
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-yellow-400/5 p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Toppers Corner</p>
              <p className="text-[10px] text-muted-foreground">{TOPPER_RESOURCES.filter(r => hasResource(toppersEssentials!, r.key)).length} resources curated</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      )}
      {topicsLite.map((topic, index) => (
        <motion.button
          key={topic.topic}
          onClick={() => selectTopic(topic.topic)}
          className="w-full p-4 rounded-xl glass-card border border-border flex items-center gap-3 group text-left hover:bg-accent/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{topic.topic}</p>
            <p className="text-xs text-muted-foreground">{topic.sub_topics?.length || 0} sub-topics</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </motion.div>
  );

  const renderRoadmap = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="glass-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Chapter Progress</p>
            <p className="text-lg font-bold text-foreground">{chapterStats.completed}/{chapterStats.total} sub-topics completed</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{chapterStats.completionPercent}% complete</p>
            <p className="text-xs text-muted-foreground">Avg best score: {chapterStats.averageBest}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${chapterStats.completionPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {topicFlows.map((topicFlow) => {
        const validSubs = topicFlow.sub_topics.filter((sub) => sub.uid_count > 0);
        const completed = validSubs.filter((sub) => (sub.progress || emptyProgress).completed).length;
        const avgBest = validSubs.length > 0
          ? Math.round(validSubs.reduce((sum, sub) => sum + Number((sub.progress || emptyProgress).bestScore || 0), 0) / validSubs.length)
          : 0;

        return (
          <div key={topicFlow.topic} className="glass-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-foreground">{topicFlow.topic}</p>
                <p className="text-xs text-muted-foreground">{completed}/{validSubs.length} completed</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="w-3.5 h-3.5" />
                Best Avg {avgBest}%
              </div>
            </div>

            <div className="space-y-3 relative">
              {validSubs.map((sub, index) => {
                const progress = sub.progress || emptyProgress;
                const status = getStatus(progress, sub.activeRun);
                const alignRight = index % 2 === 1;
                const testRun = sub.activeRuns?.test || (sub.activeRun?.mode === 'test' ? sub.activeRun : null);
                const hasTestResume = Boolean(testRun);
                const showResume = hasTestResume || (progress.hasTaken && !progress.completed);
                const buttonLabel = progress.completed ? 'Retake Test' : showResume ? 'Resume Test' : 'Start Test';
                const ButtonIcon = progress.completed ? RotateCcw : showResume ? Play : GraduationCap;

                return (
                  <motion.div
                    key={`${topicFlow.topic}-${sub.subTopic}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="w-[92%]">
                      <div className={`rounded-2xl border p-3 ${status.node}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${status.node}`}>
                            {progress.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : progress.hasTaken ? (
                              <Trophy className="w-4 h-4 text-warning" />
                            ) : (
                              <CircleDashed className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground leading-snug">{sub.subTopic}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.chip}`}>{status.label}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{sub.uid_count} questions</span>
                              <span>Attempts: {progress.attempts}</span>
                              <span>Best: {progress.bestScore}%</span>
                              {progress.hasTaken && <span>Last: {progress.lastScore}%</span>}
                              {testRun && (
                                <span className="text-primary font-semibold">
                                  {`Resume Test (${testRun.attemptedQuestions}/${testRun.totalQuestions})`}
                                </span>
                              )}
                              {progress.lastAttemptAt && (
                                <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{new Date(progress.lastAttemptAt).toLocaleDateString()}</span>
                              )}
                            </div>

                            <div className="flex justify-start">
                              <button
                                onClick={() => startQuiz(topicFlow.topic, sub, 'test')}
                                disabled={loading}
                                className="w-[40%] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-semibold hover:bg-success/25 transition-colors disabled:opacity-50"
                              >
                                <ButtonIcon className="w-3.5 h-3.5" />
                                {buttonLabel}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {validSubs.length === 0 && (
                <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">
                  No active sub-topics with questions in this topic.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <div className="glow-orb glow-orb-primary w-[350px] h-[350px] -top-32 -right-24 animate-glow-pulse" />
      <div
        className="glow-orb glow-orb-secondary w-[250px] h-[250px] bottom-40 -left-20 animate-glow-pulse"
        style={{ animationDelay: '2s' }}
      />

      <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <motion.button
            onClick={goBack}
            className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center flex-shrink-0"
            whileTap={{ scale: 0.93 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{panelTitle[panel]}</h1>
            {breadcrumb.length > 0 && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{breadcrumb.join(' > ')}</p>
            )}
          </div>
          {panel === 'subjects' && <BookOpen className="w-6 h-6 text-primary" />}
          {panel === 'roadmap' && <BookMarked className="w-6 h-6 text-primary" />}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <motion.div
              key={panel}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {panel === 'subjects' && renderSubjects()}
              {panel === 'chapters' && renderChapters()}
              {panel === 'topics' && renderTopics()}
              {panel === 'roadmap' && renderRoadmap()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toppers Corner Modal */}
      <AnimatePresence>
        {toppersOpen && toppersEssentials && (
          <motion.div
            key="toppers-modal"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={`fixed inset-0 z-[100] flex flex-col ${toppersPreviewResource === 'video' ? 'bg-[#1c1c1e]' :
                toppersPreviewResource === 'audio' ? 'bg-[#0d0d1e]' :
                  'bg-background'
              }`}
          >
            {/* Header – transparent overlay for dark resources, bordered strip for others */}
            {(() => {
              const isDark = toppersPreviewResource === 'video' || toppersPreviewResource === 'audio';
              return (
                <div
                  className={`flex items-center p-3 flex-shrink-0 w-full ${isDark ? 'bg-[#1c1c1e]' : 'border-b border-border bg-background'
                    }`}
                >
                  {toppersPreviewResource ? (
                    <button
                      onClick={closeResource}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? '' : 'bg-card border border-border'
                        }`}
                    >
                      <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-foreground'}`} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setToppersOpen(false); setToppersPreviewResource(null); }}
                        className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                      <div className="flex items-center gap-2 flex-1 min-w-0 ml-2">
                        <div className="p-1 rounded-md bg-amber-500/20 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                        </div>
                        <p className="font-bold text-foreground text-sm truncate">Toppers Corner</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Grid View */}
            {!toppersPreviewResource && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {TOPPER_RESOURCES.filter(r => hasResource(toppersEssentials!, r.key)).map(r => (
                    <button
                      key={r.key}
                      onClick={() => openResource(r.key)}
                      className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border bg-card hover:bg-amber-500/5 hover:border-amber-500/30 transition-colors"
                      style={{ minHeight: '130px' }}
                    >
                      <div className="p-3 rounded-xl bg-amber-500/15">
                        <r.icon className="w-7 h-7 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">{r.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resource Preview */}
            {toppersPreviewResource && (
              <div className="flex-1 overflow-y-auto">
                {renderResourceContent(toppersPreviewResource, toppersEssentials, chapterReactions, handleToggleReaction)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default CurriculumBrowser;
