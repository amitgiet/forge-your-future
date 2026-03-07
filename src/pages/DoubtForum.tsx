import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, MessageCircleQuestion, Plus, CheckCircle2,
    ThumbsUp, ChevronRight, Search, Send, X, Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';

// ── Types ────────────────────────────────────────────────────────────────────
interface DoubtItem {
    _id: string;
    title: string;
    body: string;
    subject: string;
    chapterId?: string;
    tags?: string[];
    upvotes: number;
    answerCount: number;
    isResolved: boolean;
    views: number;
    createdAt: string;
    userId: { _id: string; name: string };
}

const SUBJECTS = ['all', 'biology', 'chemistry', 'physics', 'general'] as const;
type SubjectFilter = typeof SUBJECTS[number];

const subjectColor: Record<string, string> = {
    biology: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    chemistry: 'bg-violet-500/10  text-violet-400  border-violet-500/30',
    physics: 'bg-sky-500/10     text-sky-400     border-sky-500/30',
    general: 'bg-muted text-muted-foreground border-border',
};

// ── Create Doubt Modal ───────────────────────────────────────────────────────
function CreateDoubtModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [subject, setSubject] = useState<'biology' | 'chemistry' | 'physics' | 'general'>('general');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) { setError('Title and description are required'); return; }
        setLoading(true);
        try {
            await api.post('/doubts', { title: title.trim(), body: body.trim(), subject });
            onCreated();
            onClose();
        } catch {
            setError('Failed to post doubt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md mx-auto bg-card border border-border rounded-t-3xl p-5 pb-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground nf-heading">Ask a Doubt</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                {error && <p className="text-xs text-destructive mb-3">{error}</p>}

                {/* Subject selector */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {(['biology', 'chemistry', 'physics', 'general'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSubject(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap border transition-all ${subject === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-muted text-muted-foreground'
                                }`}
                        >{s}</button>
                    ))}
                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short title for your doubt..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-3"
                />
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe your doubt in detail..."
                    rows={4}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none mb-4"
                />

                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3.5 nf-gradient rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Posting...' : 'Post Doubt'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ── Doubt Card ───────────────────────────────────────────────────────────────
function DoubtCard({ doubt, onClick }: { doubt: DoubtItem; onClick: () => void }) {
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 60) return `${m}m ago`;
        if (m < 1440) return `${Math.floor(m / 60)}h ago`;
        return `${Math.floor(m / 1440)}d ago`;
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-all"
        >
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border ${subjectColor[doubt.subject] ?? subjectColor.general}`}>
                            {doubt.subject}
                        </span>
                        {doubt.isResolved && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                            </span>
                        )}
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{doubt.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doubt.body}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{doubt.upvotes}</span>
                <span className="flex items-center gap-1"><MessageCircleQuestion className="w-3 h-3" />{doubt.answerCount} answers</span>
                <span>{timeAgo(doubt.createdAt)}</span>
                <span className="ml-auto">by {doubt.userId?.name ?? 'Unknown'}</span>
            </div>
        </motion.div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DoubtForum() {
    const navigate = useNavigate();
    const [doubts, setDoubts] = useState<DoubtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subject, setSubject] = useState<SubjectFilter>('all');
    const [search, setSearch] = useState('');
    const [showResolved, setShowResolved] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const fetchDoubts = useCallback(async (q?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (subject !== 'all') params.set('subject', subject);
            if (q?.trim()) params.set('search', q.trim());
            if (showResolved) params.set('isResolved', 'true');
            const res = await api.get(`/doubts?${params.toString()}`);
            setDoubts(res.data.data || []);
        } catch {
            setError('Failed to load doubts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [subject, showResolved]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchDoubts(search), 350);
        return () => clearTimeout(debounceRef.current);
    }, [fetchDoubts, search]);

    return (
        <>
            <div className="min-h-screen bg-background pb-24">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border">
                    <div className="max-w-md mx-auto px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold nf-heading">Doubt Forum</h1>
                                <p className="text-xs text-muted-foreground">Ask & answer doubts with the community</p>
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="h-9 px-3 rounded-xl nf-gradient text-white text-sm font-bold flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Ask
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mt-3">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search doubts..."
                                className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Subject filters */}
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
                            {SUBJECTS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSubject(s)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${subject === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                                        }`}
                                >{s === 'all' ? 'All' : s}</button>
                            ))}
                            <button
                                onClick={() => setShowResolved(!showResolved)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-all ${showResolved ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <CheckCircle2 className="w-3 h-3" /> Resolved
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
                    {error && <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">{error}</div>}

                    {loading && (
                        <div className="space-y-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && doubts.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                            <MessageCircleQuestion className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium">No doubts found</p>
                            <p className="text-xs text-center">Be the first to ask a doubt in this subject!</p>
                            <button onClick={() => setShowCreate(true)} className="mt-2 px-4 py-2 nf-gradient text-white text-sm font-bold rounded-xl">
                                Ask a Doubt
                            </button>
                        </div>
                    )}

                    {!loading && doubts.map((d) => (
                        <DoubtCard key={d._id} doubt={d} onClick={() => navigate(`/doubts/${d._id}`)} />
                    ))}
                </div>
            </div>

            <BottomNav />

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateDoubtModal onClose={() => setShowCreate(false)} onCreated={() => fetchDoubts(search)} />
                )}
            </AnimatePresence>
        </>
    );
}
