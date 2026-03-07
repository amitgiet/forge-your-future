import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ThumbsUp, CheckCircle2, Send, Loader2, BadgeCheck, MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';

// ── Types ────────────────────────────────────────────────────────────────────
interface Answer {
    _id: string;
    body: string;
    upvotes: number;
    isVerified: boolean;
    isAccepted: boolean;
    createdAt: string;
    userId: { _id: string; name: string };
}

interface DoubtFull {
    _id: string;
    title: string;
    body: string;
    subject: string;
    chapterId?: string;
    tags?: string[];
    upvotes: number;
    isResolved: boolean;
    views: number;
    createdAt: string;
    userId: { _id: string; name: string };
    answers: Answer[];
}

const subjectColor: Record<string, string> = {
    biology: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    chemistry: 'bg-violet-500/10  text-violet-400  border-violet-500/30',
    physics: 'bg-sky-500/10     text-sky-400     border-sky-500/30',
    general: 'bg-muted text-muted-foreground border-border',
};

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
};

// ── Component ────────────────────────────────────────────────────────────────
export default function DoubtDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [doubt, setDoubt] = useState<DoubtFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [answerBody, setAnswerBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [upvotedDoubt, setUpvotedDoubt] = useState(false);
    const [upvotedAnswers, setUpvotedAnswers] = useState<Set<string>>(new Set());

    const fetchDoubt = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`/doubts/${id}`);
            setDoubt(res.data.data);
        } catch {
            setError('Failed to load doubt.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoubt(); }, [id]);

    const handleUpvoteDoubt = async () => {
        if (!doubt) return;
        try {
            const res = await api.post(`/doubts/${doubt._id}/upvote`);
            const { upvotes, upvoted } = res.data.data;
            setDoubt((prev) => prev ? { ...prev, upvotes } : prev);
            setUpvotedDoubt(upvoted);
        } catch { /* noop */ }
    };

    const handleUpvoteAnswer = async (aid: string) => {
        if (!doubt) return;
        try {
            const res = await api.post(`/doubts/${doubt._id}/answers/${aid}/upvote`);
            const { upvotes, upvoted } = res.data.data;
            setDoubt((prev) => {
                if (!prev) return prev;
                return { ...prev, answers: prev.answers.map((a) => a._id === aid ? { ...a, upvotes } : a) };
            });
            setUpvotedAnswers((prev) => {
                const next = new Set(prev);
                if (upvoted) next.add(aid); else next.delete(aid);
                return next;
            });
        } catch { /* noop */ }
    };

    const handleSubmitAnswer = async () => {
        if (!answerBody.trim() || !doubt) return;
        setSubmitting(true);
        setError(null);
        try {
            await api.post(`/doubts/${doubt._id}/answer`, { body: answerBody.trim() });
            setAnswerBody('');
            await fetchDoubt();
        } catch {
            setError('Failed to post answer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptAnswer = async (aid: string) => {
        if (!doubt) return;
        try {
            await api.put(`/doubts/${doubt._id}/answers/${aid}/accept`);
            await fetchDoubt();
        } catch { /* noop */ }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!doubt) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-muted-foreground">Doubt not found.</p>
                <button onClick={() => navigate('/doubts')} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">Back to Forum</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate('/doubts')} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-bold nf-heading truncate">Doubt Detail</h1>
                    </div>
                    {doubt.isResolved && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/30">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
                {error && <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive">{error}</div>}

                {/* Doubt card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border ${subjectColor[doubt.subject] ?? subjectColor.general}`}>
                            {doubt.subject}
                        </span>
                        {doubt.chapterId && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{doubt.chapterId}</span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{timeAgo(doubt.createdAt)}</span>
                    </div>

                    <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">{doubt.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{doubt.body}</p>

                    {(doubt.tags?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {doubt.tags!.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                        <span>by <span className="font-semibold text-foreground">{doubt.userId?.name ?? 'Unknown'}</span></span>
                        <span>{doubt.views} views</span>
                        <button
                            onClick={handleUpvoteDoubt}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${upvotedDoubt ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted border-border hover:border-primary/30'
                                }`}
                        >
                            <ThumbsUp className="w-3 h-3" /> {doubt.upvotes}
                        </button>
                    </div>
                </motion.div>

                {/* Answers */}
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {doubt.answers.length} Answer{doubt.answers.length !== 1 ? 's' : ''}
                    </h3>

                    <AnimatePresence>
                        {doubt.answers
                            .slice()
                            .sort((a, b) => {
                                if (a.isAccepted && !b.isAccepted) return -1;
                                if (!a.isAccepted && b.isAccepted) return 1;
                                if (a.isVerified && !b.isVerified) return -1;
                                if (!a.isVerified && b.isVerified) return 1;
                                return b.upvotes - a.upvotes;
                            })
                            .map((ans, i) => (
                                <motion.div
                                    key={ans._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`bg-card border rounded-2xl p-4 mb-3 ${ans.isAccepted ? 'border-success/50 bg-success/5' : 'border-border'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-foreground">{ans.userId?.name ?? 'User'}</span>
                                        {ans.isVerified && (
                                            <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                                <BadgeCheck className="w-2.5 h-2.5" /> Expert
                                            </span>
                                        )}
                                        {ans.isAccepted && (
                                            <span className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
                                            </span>
                                        )}
                                        <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(ans.createdAt)}</span>
                                    </div>

                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ans.body}</p>

                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                        <button
                                            onClick={() => handleUpvoteAnswer(ans._id)}
                                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${upvotedAnswers.has(ans._id) ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted border-border text-muted-foreground'
                                                }`}
                                        >
                                            <ThumbsUp className="w-3 h-3" /> {ans.upvotes}
                                        </button>
                                        {!doubt.isResolved && (
                                            <button
                                                onClick={() => handleAcceptAnswer(ans._id)}
                                                className="text-xs text-success hover:text-success/80 transition-colors"
                                            >
                                                ✓ Accept
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                    </AnimatePresence>

                    {doubt.answers.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No answers yet. Be the first to help!
                        </div>
                    )}
                </div>
            </div>

            {/* Answer input bar */}
            <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-4 py-3">
                <div className="max-w-md mx-auto flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        value={answerBody}
                        onChange={(e) => setAnswerBody(e.target.value)}
                        placeholder="Write your answer..."
                        rows={2}
                        className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                    />
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!answerBody.trim() || submitting}
                        className="h-10 w-10 rounded-xl nf-gradient flex items-center justify-center disabled:opacity-50 text-white flex-shrink-0"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
