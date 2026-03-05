import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, Mic, MicOff, Download, TrendingUp, BookOpen, Target, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { BarChartComponent, PieChartComponent } from './AICharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  chartData?: { type: string; chartType: string; data: any[]; message: string };
  quizData?: { type: string; data: Array<{ quizId?: string; lineId?: string; topic: string; subject: string; chapter: string; reason?: string }> };
  toolsUsed?: string[];
  dataSourcesUsed?: string[];
  dataAvailability?: 'sufficient' | 'partial' | 'insufficient';
  lastUpdatedAt?: string;
  mode?: 'coach' | 'analysis' | 'doubt';
  blocks?: Array<{ type: 'markdown' | 'chart' | 'quiz_suggestions' | 'actions'; data: any }>;
  actions?: Array<{ id: string; label: string; actionType: string; payload?: any }>;
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'coach' | 'analysis' | 'doubt'>('coach');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const CACHE_KEY = 'aiChat.cache.v2';
  const MAX_UI_MESSAGES = 15;

  const persistCache = (nextChatId: string | null, nextMessages: Message[], nextMode: 'coach' | 'analysis' | 'doubt') => {
    try {
      const trimmed = nextMessages.slice(-MAX_UI_MESSAGES);
      const payload = {
        chatId: nextChatId,
        mode: nextMode,
        messages: trimmed.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString(),
          chartData: m.chartData || null,
          quizData: m.quizData || null,
          blocks: m.blocks || [],
          actions: m.actions || [],
          toolsUsed: m.toolsUsed || [],
          dataSourcesUsed: m.dataSourcesUsed || [],
          dataAvailability: m.dataAvailability || 'insufficient',
          lastUpdatedAt: m.lastUpdatedAt || null,
          mode: m.mode || nextMode
        }))
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => { setIsListening(false); };
    }
  }, []);

  useEffect(() => {
    const prefill = (location.state as any)?.prefillPrompt;
    if (typeof prefill === 'string' && prefill.trim().length > 0) {
      setInput((prev) => (prev && prev.trim().length > 0 ? prev : prefill));
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const parseChartData = (text: string) => {
    try {
      const decodedText = text
        .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
      const jsonMatch = decodedText.match(/\{"type":"chart".*?\}/s);
      if (jsonMatch) {
        const chartData = JSON.parse(jsonMatch[0]);
        const cleanText = decodedText.replace(jsonMatch[0], '').trim();
        return { chartData, cleanText, quizData: null };
      }
      const quizMatch = decodedText.match(/\{"type":"quizzes"[^}]*"data":\[.*?\]\}/s);
      if (quizMatch) {
        const quizData = JSON.parse(quizMatch[0]);
        const cleanText = decodedText.replace(quizMatch[0], '').trim();
        return { chartData: null, cleanText, quizData };
      }
      return { chartData: null, cleanText: decodedText, quizData: null };
    } catch (e) {
      console.error('Parse error:', e, text.substring(0, 200));
      const decodedText = text
        .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
      return { chartData: null, cleanText: decodedText, quizData: null };
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (parsed.chatId) setChatId(parsed.chatId);
        if (parsed.mode) setMode(parsed.mode);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const hydrated: Message[] = parsed.messages.map((m: any) => {
            const ts = new Date(m.timestamp);
            if (m.role === 'ai') {
              const { chartData, cleanText, quizData } = parseChartData(m.content);
              return {
                role: 'ai', content: cleanText || m.content, timestamp: ts,
                chartData: m.chartData || chartData, quizData: m.quizData || quizData,
                blocks: Array.isArray(m.blocks) ? m.blocks : undefined,
                actions: Array.isArray(m.actions) ? m.actions : undefined,
                toolsUsed: Array.isArray(m.toolsUsed) ? m.toolsUsed : undefined,
                dataSourcesUsed: Array.isArray(m.dataSourcesUsed) ? m.dataSourcesUsed : undefined,
                dataAvailability: m.dataAvailability, lastUpdatedAt: m.lastUpdatedAt,
                mode: m.mode || parsed.mode || 'coach'
              };
            }
            return { role: 'user', content: m.content, timestamp: ts };
          });
          setMessages(hydrated.slice(-MAX_UI_MESSAGES));
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const reconcile = async () => {
      if (!chatId) return;
      try {
        const res = await api.get(`/ai-chat/history/${chatId}?limit=${MAX_UI_MESSAGES}`);
        const chat = res.data?.data;
        const rawMessages = Array.isArray(chat?.messages) ? chat.messages : [];
        const mapped: Message[] = rawMessages.map((m: any) => {
          const ts = new Date(m.timestamp || Date.now());
          if (m.sender === 'ai') {
            const { chartData, cleanText, quizData } = parseChartData(String(m.content || ''));
            return { role: 'ai', content: cleanText || String(m.content || ''), timestamp: ts, chartData, quizData };
          }
          return { role: 'user', content: String(m.content || ''), timestamp: ts };
        });
        setMessages(mapped.slice(-MAX_UI_MESSAGES));
      } catch { /* ignore */ }
    };
    reconcile();
  }, [chatId]);

  useEffect(() => { persistCache(chatId, messages, mode); }, [chatId, messages, mode]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date(), mode };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/ai-chat/message', {
        message: input, chatId, mode,
        clientContext: {
          route: window.location.pathname,
          preferredLanguage: (localStorage.getItem('preferredLanguage') === 'hi' ? 'hi' : 'en'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      const nextChatId = response.data.data.chatId;
      if (!chatId && nextChatId) setChatId(nextChatId);
      const payload = response.data?.data || {};
      const responseText = String(payload.message || '');
      const ui = payload.ui || null;
      const { chartData, cleanText, quizData } = parseChartData(responseText);
      const aiMessage: Message = {
        role: 'ai', content: cleanText || responseText, timestamp: new Date(), chartData, quizData,
        toolsUsed: Array.isArray(payload.toolsUsed) ? payload.toolsUsed : [],
        dataSourcesUsed: Array.isArray(payload.dataSourcesUsed) ? payload.dataSourcesUsed : [],
        dataAvailability: payload.dataAvailability || 'insufficient',
        lastUpdatedAt: ui?.lastUpdatedAt || new Date().toISOString(), mode,
        blocks: Array.isArray(ui?.blocks) ? ui.blocks : undefined,
        actions: Array.isArray(ui?.actions) ? ui.actions : undefined
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const exportChat = () => {
    const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'AI Assistant'} (${new Date(m.timestamp).toLocaleString()}):\n${m.content}\n`).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const startNewChat = () => {
    (async () => {
      try {
        const res = await api.post('/ai-chat/new');
        const newId = res.data?.data?.chatId || null;
        setMessages([]);
        setChatId(newId);
        persistCache(newId, [], mode);
      } catch {
        setMessages([]);
        setChatId(null);
        persistCache(null, [], mode);
      }
    })();
  };

  const quickQuestions = [
    { icon: TrendingUp, text: "What are my weak points?", color: "text-destructive" },
    { icon: BookOpen, text: "Review my last quiz", color: "text-primary" },
    { icon: Target, text: "Build my today plan", color: "text-success" }
  ];

  const modeOptions: Array<{ id: 'coach' | 'analysis' | 'doubt'; label: string; desc: string }> = [
    { id: 'coach', label: '🧠 Coach', desc: 'Study guidance' },
    { id: 'analysis', label: '📊 Analysis', desc: 'Performance insights' },
    { id: 'doubt', label: '❓ Doubt', desc: 'Ask questions' }
  ];

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      className="prose prose-sm max-w-none text-sm whitespace-pre-wrap text-inherit prose-headings:text-inherit prose-strong:text-inherit prose-code:text-inherit prose-p:my-1 prose-li:my-0.5"
    >
      {content}
    </ReactMarkdown>
  );

  const startQuizFromAction = async (quiz: any) => {
    if (quiz?.quizId) {
      const response = await api.get(`/quiz-generator/${quiz.quizId}`);
      const storedQuiz = response.data.data;
      const questions = (storedQuiz.questions || []).map((q: any, idx: number) => ({
        id: q._id || idx + 1, question: q.question, type: 'mcq', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation
      }));
      navigate('/ai-quiz-session', { state: { quizId: String(quiz.quizId), topic: storedQuiz.topic || quiz.topic, subject: storedQuiz.subject || quiz.subject, chapter: storedQuiz.chapterId || quiz.chapter || '', questions } });
      return;
    }
    if (quiz?.lineId) {
      const response = await api.get(`/neuronz/quizzes/${quiz.lineId}`);
      const questions = (response.data.data || []).map((q: any, idx: number) => ({
        id: q._id || idx + 1, question: q.question, type: 'mcq', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation
      }));
      navigate('/ai-quiz-session', { state: { lineId: String(quiz.lineId), topic: quiz.topic, subject: quiz.subject, chapter: String(quiz.chapter ?? ''), questions } });
    }
  };

  const handleActionClick = async (action: any) => {
    const type = String(action?.actionType || '');
    const payload = action?.payload || {};
    try {
      if (type === 'resume_curriculum' || type === 'start_curriculum_quiz') {
        navigate('/curriculum-browser', { state: { selectedSubject: payload.subject, selectedChapterId: payload.chapterId, selectedTopic: payload.topic, selectedSubTopic: payload.subTopic, preferredMode: payload.mode || 'practice', resumeRunId: payload.runId } });
        return;
      }
      if (type === 'open_mock_pdf' && payload.questionPdf) {
        navigate('/tests/pdf-viewer', { state: { url: payload.questionPdf, title: payload.title || 'Mock PDF' } });
        return;
      }
      if (type === 'open_test_series') { navigate('/tests'); return; }
      if (type === 'take_quiz' || type === 'start_ai_quiz') { await startQuizFromAction(payload); return; }
    } catch (e) { console.error('Action execution failed:', e); }
  };

  const renderActionCards = (actions?: any[]) => {
    if (!Array.isArray(actions) || actions.length === 0) return null;
    return (
      <div className="mt-3 space-y-2">
        {actions.map((action) => (
          <button key={String(action.id || action.label)} onClick={() => handleActionClick(action)}
            className="w-full text-left p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-sm font-semibold text-foreground">{String(action.label || 'Open')}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{String(action.actionType || '')}</p>
          </button>
        ))}
      </div>
    );
  };

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null;
    return (
      <div className="mt-3 p-3 bg-muted/50 rounded-xl border border-border">
        {chartData.chartType === 'bar' && <BarChartComponent data={chartData.data} />}
        {chartData.chartType === 'pie' && <PieChartComponent data={chartData.data} />}
      </div>
    );
  };

  const renderQuizSuggestions = (quizData: any) => {
    if (!quizData || !quizData.data || quizData.data.length === 0) return null;

    const handleStartQuiz = async (quiz: any) => {
      try {
        const userId = user?._id ? String(user._id) : null;
        if (quiz.quizId) {
          const quizIdStr = String(quiz.quizId);
          if (!/^[a-fA-F0-9]{24}$/.test(quizIdStr)) { alert('Invalid quiz id returned. Please ask again.'); return; }
          const response = await api.get(`/quiz-generator/${quiz.quizId}`);
          const storedQuiz = response.data.data;
          const questions = storedQuiz.questions || [];
          const mappedQuestions = questions.map((q: any, idx: number) => ({
            id: q._id || idx + 1, question: q.question, type: 'mcq', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation
          }));
          const attempts = Array.isArray(storedQuiz?.attempts) ? storedQuiz.attempts : [];
          const myAttempts = userId ? attempts.filter((a: any) => String(a?.userId) === userId) : [];
          if (myAttempts.length > 0) {
            const last = myAttempts.reduce((best: any, cur: any) => {
              const bd = best?.attemptDate ? new Date(best.attemptDate).getTime() : 0;
              const cd = cur?.attemptDate ? new Date(cur.attemptDate).getTime() : 0;
              return cd >= bd ? cur : best;
            }, myAttempts[0]);
            const sumTotal = Number(last?.totalQuestions || mappedQuestions.length || 0);
            const sumScore = Number(last?.score || 0);
            const sumPct = Number(last?.percentage || (sumTotal > 0 ? Math.round((sumScore / sumTotal) * 100) : 0));
            const sumSubject = String(storedQuiz.subject || quiz.subject || 'General');
            const sumTopic = String(storedQuiz.topic || quiz.topic || 'Practice Quiz');
            navigate('/quiz-results', {
              state: {
                mode: 'practice', subject: sumSubject, topic: sumTopic, totalQuestions: sumTotal,
                summary: { score: sumScore, total: sumTotal, percentage: sumPct, subject: sumSubject, topic: sumTopic, chapterLabel: String(storedQuiz.chapterId || quiz.chapter || ''), attemptedAt: last?.attemptDate ? String(last.attemptDate) : undefined },
                returnTo: '/ai-assistant', returnLabel: 'AI Assistant',
                prefillPrompt: `Give me another quiz on ${sumTopic} and focus on my mistakes.`,
                retryTo: '/ai-quiz-session', retryState: { quizId: quizIdStr, topic: sumTopic, subject: sumSubject, chapter: storedQuiz.chapterId || quiz.chapter || '', questions: mappedQuestions }
              }
            });
            return;
          }
          navigate('/ai-quiz-session', { state: { quizId: quizIdStr, topic: storedQuiz.topic || quiz.topic, subject: storedQuiz.subject || quiz.subject, chapter: storedQuiz.chapterId || quiz.chapter || '', questions: mappedQuestions } });
          return;
        }
        const response = await api.get(`/neuronz/quizzes/${quiz.lineId}`);
        const questions = response.data.data || [];
        const mappedQuestions = questions.map((q: any, idx: number) => ({
          id: q._id || idx + 1, question: q.question, type: 'mcq', options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation
        }));
        try {
          const analyticsRes = await api.get(`/neuronz/${quiz.lineId}/analytics`);
          const analytics = analyticsRes.data?.data;
          const totalSessions = Number(analytics?.totalSessions || 0);
          if (totalSessions > 0) {
            const acc = Number(analytics?.recentAccuracy ?? analytics?.overallAccuracy ?? 0);
            const pct = Math.round(acc);
            const total = mappedQuestions.length;
            const score = total > 0 ? Math.round((pct / 100) * total) : 0;
            const sumSubject = String(quiz.subject || 'General');
            const sumTopic = String(quiz.topic || 'Practice Quiz');
            navigate('/quiz-results', {
              state: {
                mode: 'practice', subject: sumSubject, topic: sumTopic, totalQuestions: total,
                summary: { score, total, percentage: pct, subject: sumSubject, topic: sumTopic, chapterLabel: String(quiz.chapter ?? ''), attemptedAt: analytics?.lastReviewed ? String(analytics.lastReviewed) : undefined },
                returnTo: '/ai-assistant', returnLabel: 'AI Assistant',
                prefillPrompt: `Give me another quiz on ${sumTopic} and focus on my mistakes.`,
                retryTo: '/ai-quiz-session', retryState: { lineId: String(quiz.lineId), topic: sumTopic, subject: sumSubject, chapter: String(quiz.chapter ?? ''), questions: mappedQuestions }
              }
            });
            return;
          }
        } catch { /* ignore */ }
        navigate('/ai-quiz-session', { state: { lineId: String(quiz.lineId), topic: quiz.topic, subject: quiz.subject, chapter: String(quiz.chapter ?? ''), questions: mappedQuestions } });
      } catch (error) {
        console.error('Failed to start quiz:', error);
        alert('Failed to load quiz. Please try again.');
      }
    };

    return (
      <div className="mt-3 space-y-2">
        {quizData.data.map((quiz: any, idx: number) => (
          <div key={idx} className="p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-all" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{quiz.topic}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{quiz.subject} • Chapter {quiz.chapter}</p>
                {quiz.reason && <p className="text-[11px] text-primary mt-1 font-medium">{quiz.reason}</p>}
              </div>
              <button onClick={() => handleStartQuiz(quiz)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground whitespace-nowrap" style={{ background: 'var(--gradient-primary)' }}>
                Take Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground leading-tight">AI Study Assistant</h2>
              <p className="text-[11px] text-muted-foreground">Powered by your study data</p>
            </div>
          </div>
          <div className="flex gap-1">
            {messages.length > 0 && (
              <>
                <button onClick={exportChat} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={startNewChat} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="px-4 py-2 border-b border-border bg-card/80">
        <div className="flex items-center gap-2">
          {modeOptions.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                mode === m.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted text-muted-foreground border-border hover:text-foreground hover:border-primary/20'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' }}>
              <MessageSquare className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Hi {user?.name}! 👋</h3>
            <p className="text-sm text-muted-foreground mb-6">I can help you analyze your performance and study better</p>

            <div className="space-y-2 max-w-sm mx-auto">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => setInput(q.text)}
                  className="w-full text-left p-3.5 bg-card border border-border rounded-xl text-sm text-foreground transition-all hover:border-primary/30 flex items-center gap-3"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    q.color === 'text-destructive' ? 'bg-destructive/10' : q.color === 'text-primary' ? 'bg-primary/10' : 'bg-success/10'
                  }`}>
                    <q.icon className={`w-4 h-4 ${q.color}`} />
                  </div>
                  <span className="font-medium">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <div className={`max-w-[78%] p-3.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border text-foreground rounded-bl-md'
              }`}
                style={msg.role === 'user' ? { background: 'var(--gradient-primary)' } : { boxShadow: 'var(--shadow-sm)' }}>
                {msg.blocks && msg.blocks.length > 0 ? (
                  <div className="space-y-3">
                    {msg.blocks.map((block, blockIdx) => {
                      if (block.type === 'markdown') return <div key={`b-${blockIdx}`}>{renderMarkdown(String(block?.data?.content || msg.content || ''))}</div>;
                      if (block.type === 'chart') return <div key={`b-${blockIdx}`}>{renderChart(block.data)}</div>;
                      if (block.type === 'quiz_suggestions') return <div key={`b-${blockIdx}`}>{renderQuizSuggestions({ data: Array.isArray(block.data) ? block.data : block?.data?.data })}</div>;
                      if (block.type === 'actions') { const items = Array.isArray(block?.data?.items) ? block.data.items : msg.actions; return <div key={`b-${blockIdx}`}>{renderActionCards(items)}</div>; }
                      return null;
                    })}
                  </div>
                ) : (
                  <>
                    {renderMarkdown(msg.content)}
                    {msg.chartData && renderChart(msg.chartData)}
                    {msg.quizData && renderQuizSuggestions(msg.quizData)}
                    {renderActionCards(msg.actions)}
                  </>
                )}
                {msg.role === 'ai' && (
                  <div className="mt-2 space-y-1">
                    {msg.dataAvailability && (
                      <p className="text-[10px] text-muted-foreground">Data: {msg.dataAvailability}</p>
                    )}
                    {Array.isArray(msg.dataSourcesUsed) && msg.dataSourcesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.dataSourcesUsed.map((source) => (
                          <span key={source} className="text-[10px] px-1.5 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">{source}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[10px] opacity-50 mt-1.5 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border p-3.5 rounded-2xl rounded-bl-md" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-muted border border-border rounded-2xl px-4 py-2.5 flex items-center">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
              placeholder="Ask me anything..." disabled={loading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50" />
            {recognitionRef.current && (
              <button onClick={toggleVoiceInput} disabled={loading}
                className={`ml-2 p-1.5 rounded-lg transition-all ${isListening ? 'bg-destructive/10 text-destructive animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-all"
            style={{ background: 'var(--gradient-primary)', boxShadow: input.trim() && !loading ? 'var(--shadow-glow-primary)' : 'none' }}>
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
