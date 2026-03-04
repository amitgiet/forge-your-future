import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, Mic, MicOff, Download, TrendingUp, BookOpen, Target, ArrowLeft } from 'lucide-react';
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
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Support prefilled prompt when returning from results (Fix Weak Areas)
  useEffect(() => {
    const prefill = (location.state as any)?.prefillPrompt;
    if (typeof prefill === 'string' && prefill.trim().length > 0) {
      setInput((prev) => (prev && prev.trim().length > 0 ? prev : prefill));
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseChartData = (text: string) => {
    try {
      // First decode all HTML entities
      const decodedText = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
      
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
      // Return decoded text even if parsing fails
      const decodedText = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
      return { chartData: null, cleanText: decodedText, quizData: null };
    }
  };

  // Hydrate from cache, then reconcile with DB (last 15)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          chatId?: string | null;
          mode?: 'coach' | 'analysis' | 'doubt';
          messages?: Array<{
            role: 'user' | 'ai';
            content: string;
            timestamp: string;
            chartData?: any;
            quizData?: any;
            blocks?: any[];
            actions?: any[];
            toolsUsed?: string[];
            dataSourcesUsed?: string[];
            dataAvailability?: 'sufficient' | 'partial' | 'insufficient';
            lastUpdatedAt?: string;
            mode?: 'coach' | 'analysis' | 'doubt';
          }>;
        };
        if (parsed.chatId) setChatId(parsed.chatId);
        if (parsed.mode) setMode(parsed.mode);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const hydrated: Message[] = parsed.messages.map((m) => {
            const ts = new Date(m.timestamp);
            if (m.role === 'ai') {
              const { chartData, cleanText, quizData } = parseChartData(m.content);
              return {
                role: 'ai',
                content: cleanText || m.content,
                timestamp: ts,
                chartData: m.chartData || chartData,
                quizData: m.quizData || quizData,
                blocks: Array.isArray(m.blocks) ? m.blocks : undefined,
                actions: Array.isArray(m.actions) ? m.actions : undefined,
                toolsUsed: Array.isArray(m.toolsUsed) ? m.toolsUsed : undefined,
                dataSourcesUsed: Array.isArray(m.dataSourcesUsed) ? m.dataSourcesUsed : undefined,
                dataAvailability: m.dataAvailability,
                lastUpdatedAt: m.lastUpdatedAt,
                mode: m.mode || parsed.mode || 'coach'
              };
            }
            return { role: 'user', content: m.content, timestamp: ts };
          });
          setMessages(hydrated.slice(-MAX_UI_MESSAGES));
        }
      }
    } catch {
      // ignore
    }
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
      } catch (e) {
        // ignore
      }
    };
    reconcile();
  }, [chatId]);

  useEffect(() => {
    persistCache(chatId, messages, mode);
  }, [chatId, messages, mode]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      mode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai-chat/message', {
        message: input,
        chatId,
        mode,
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
        role: 'ai',
        content: cleanText || responseText,
        timestamp: new Date(),
        chartData,
        quizData,
        toolsUsed: Array.isArray(payload.toolsUsed) ? payload.toolsUsed : [],
        dataSourcesUsed: Array.isArray(payload.dataSourcesUsed) ? payload.dataSourcesUsed : [],
        dataAvailability: payload.dataAvailability || 'insufficient',
        lastUpdatedAt: ui?.lastUpdatedAt || new Date().toISOString(),
        mode,
        blocks: Array.isArray(ui?.blocks) ? ui.blocks : undefined,
        actions: Array.isArray(ui?.actions) ? ui.actions : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const exportChat = () => {
    const chatText = messages.map(m => 
      `${m.role === 'user' ? 'You' : 'AI Assistant'} (${new Date(m.timestamp).toLocaleString()}):\n${m.content}\n`
    ).join('\n');
    
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
    { icon: TrendingUp, text: "What are my weak points?", color: "text-red-400" },
    { icon: BookOpen, text: "Review my last quiz", color: "text-blue-400" },
    { icon: Target, text: "Build my today plan", color: "text-green-400" }
  ];

  const modeOptions: Array<{ id: 'coach' | 'analysis' | 'doubt'; label: string }> = [
    { id: 'coach', label: 'Coach' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'doubt', label: 'Doubt' }
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
        id: q._id || idx + 1,
        question: q.question,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      navigate('/ai-quiz-session', {
        state: {
          quizId: String(quiz.quizId),
          topic: storedQuiz.topic || quiz.topic,
          subject: storedQuiz.subject || quiz.subject,
          chapter: storedQuiz.chapterId || quiz.chapter || '',
          questions
        }
      });
      return;
    }

    if (quiz?.lineId) {
      const response = await api.get(`/neuronz/quizzes/${quiz.lineId}`);
      const questions = (response.data.data || []).map((q: any, idx: number) => ({
        id: q._id || idx + 1,
        question: q.question,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      navigate('/ai-quiz-session', {
        state: {
          lineId: String(quiz.lineId),
          topic: quiz.topic,
          subject: quiz.subject,
          chapter: String(quiz.chapter ?? ''),
          questions
        }
      });
    }
  };

  const handleActionClick = async (action: any) => {
    const type = String(action?.actionType || '');
    const payload = action?.payload || {};
    try {
      if (type === 'resume_curriculum' || type === 'start_curriculum_quiz') {
        navigate('/curriculum-browser', {
          state: {
            selectedSubject: payload.subject,
            selectedChapterId: payload.chapterId,
            selectedTopic: payload.topic,
            selectedSubTopic: payload.subTopic,
            preferredMode: payload.mode || 'practice',
            resumeRunId: payload.runId
          }
        });
        return;
      }
      if (type === 'open_mock_pdf' && payload.questionPdf) {
        navigate('/tests/pdf-viewer', {
          state: {
            url: payload.questionPdf,
            title: payload.title || 'Mock PDF'
          }
        });
        return;
      }
      if (type === 'open_test_series') {
        navigate('/tests');
        return;
      }
      if (type === 'take_quiz' || type === 'start_ai_quiz') {
        await startQuizFromAction(payload);
        return;
      }
    } catch (e) {
      console.error('Action execution failed:', e);
    }
  };

  const renderActionCards = (actions?: any[]) => {
    if (!Array.isArray(actions) || actions.length === 0) return null;
    return (
      <div className="mt-3 space-y-2">
        {actions.map((action) => (
          <button
            key={String(action.id || action.label)}
            onClick={() => handleActionClick(action)}
            className="w-full text-left p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">{String(action.label || 'Open')}</p>
            <p className="text-xs text-muted-foreground mt-1">{String(action.actionType || '')}</p>
          </button>
        ))}
      </div>
    );
  };

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null;
    
    return (
      <div className="mt-3 p-3 bg-muted rounded-lg">
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

        // 1) Stored quiz (GeneratedQuiz) path
        if (quiz.quizId) {
          const quizIdStr = String(quiz.quizId);
          if (!/^[a-fA-F0-9]{24}$/.test(quizIdStr)) {
            alert('Invalid quiz id returned. Please ask again.');
            return;
          }
          const response = await api.get(`/quiz-generator/${quiz.quizId}`);
          const storedQuiz = response.data.data;
          const questions = storedQuiz.questions || [];

          const mappedQuestions = questions.map((q: any, idx: number) => ({
            id: q._id || idx + 1,
            question: q.question,
            type: 'mcq',
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }));

          // If already attempted, show last result + Retry instead of restarting.
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
                mode: 'practice',
                subject: sumSubject,
                topic: sumTopic,
                totalQuestions: sumTotal,
                summary: {
                  score: sumScore,
                  total: sumTotal,
                  percentage: sumPct,
                  subject: sumSubject,
                  topic: sumTopic,
                  chapterLabel: String(storedQuiz.chapterId || quiz.chapter || ''),
                  attemptedAt: last?.attemptDate ? String(last.attemptDate) : undefined
                },
                returnTo: '/ai-assistant',
                returnLabel: 'AI Assistant',
                prefillPrompt: `Give me another quiz on ${sumTopic} and focus on my mistakes.`,
                retryTo: '/ai-quiz-session',
                retryState: {
                  quizId: quizIdStr,
                  topic: sumTopic,
                  subject: sumSubject,
                  chapter: storedQuiz.chapterId || quiz.chapter || '',
                  questions: mappedQuestions
                }
              }
            });
            return;
          }

          navigate('/ai-quiz-session', {
            state: {
              quizId: quizIdStr,
              topic: storedQuiz.topic || quiz.topic,
              subject: storedQuiz.subject || quiz.subject,
              chapter: storedQuiz.chapterId || quiz.chapter || '',
              questions: mappedQuestions
            }
          });
          return;
        }

        // 2) NCERT micro-quiz path (NeuronZ cached quizzes)
        const response = await api.get(`/neuronz/quizzes/${quiz.lineId}`);
        const questions = response.data.data || [];
        
        const mappedQuestions = questions.map((q: any, idx: number) => ({
          id: q._id || idx + 1,
          question: q.question,
          type: 'mcq',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }));

        // If already attempted, show last known accuracy summary + Retry.
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
                mode: 'practice',
                subject: sumSubject,
                topic: sumTopic,
                totalQuestions: total,
                summary: {
                  score,
                  total,
                  percentage: pct,
                  subject: sumSubject,
                  topic: sumTopic,
                  chapterLabel: String(quiz.chapter ?? ''),
                  attemptedAt: analytics?.lastReviewed ? String(analytics.lastReviewed) : undefined
                },
                returnTo: '/ai-assistant',
                returnLabel: 'AI Assistant',
                prefillPrompt: `Give me another quiz on ${sumTopic} and focus on my mistakes.`,
                retryTo: '/ai-quiz-session',
                retryState: {
                  lineId: String(quiz.lineId),
                  topic: sumTopic,
                  subject: sumSubject,
                  chapter: String(quiz.chapter ?? ''),
                  questions: mappedQuestions
                }
              }
            });
            return;
          }
        } catch {
          // ignore analytics failures
        }

        // Navigate to Neuronz-style quiz player (no instant reveal)
        navigate('/ai-quiz-session', {
          state: {
            lineId: String(quiz.lineId),
            topic: quiz.topic,
            subject: quiz.subject,
            chapter: String(quiz.chapter ?? ''),
            questions: mappedQuestions
          }
        });
      } catch (error) {
        console.error('Failed to start quiz:', error);
        alert('Failed to load quiz. Please try again.');
      }
    };
    
    return (
      <div className="mt-3 space-y-2">
        {quizData.data.map((quiz: any, idx: number) => (
          <div key={idx} className="p-3 bg-muted rounded-lg border border-border hover:border-primary transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{quiz.topic}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quiz.subject} • Chapter {quiz.chapter}
                </p>
                {quiz.reason && (
                  <p className="text-xs text-primary mt-1">{quiz.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleStartQuiz(quiz)}
                className="nf-btn-primary px-3 py-1.5 text-xs whitespace-nowrap"
              >
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">AI Study Assistant</h2>
            <p className="text-xs text-muted-foreground">Ask me anything about your performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button
              onClick={exportChat}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-muted"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border bg-card/60">
        <div className="flex items-center gap-2 overflow-x-auto">
          {modeOptions.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                mode === m.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Hi {user?.name}! 👋</h3>
            <p className="text-muted-foreground mb-6">I can help you analyze your performance and study better</p>
            
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q.text)}
                  className="text-left p-3 bg-muted hover:bg-accent rounded-lg text-sm text-foreground transition-colors flex items-center gap-2"
                >
                  <q.icon className={`w-4 h-4 ${q.color}`} />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.blocks && msg.blocks.length > 0 ? (
                  <div className="space-y-3">
                    {msg.blocks.map((block, blockIdx) => {
                      if (block.type === 'markdown') {
                        return (
                          <div key={`b-${blockIdx}`}>
                            {renderMarkdown(String(block?.data?.content || msg.content || ''))}
                          </div>
                        );
                      }
                      if (block.type === 'chart') {
                        return <div key={`b-${blockIdx}`}>{renderChart(block.data)}</div>;
                      }
                      if (block.type === 'quiz_suggestions') {
                        return <div key={`b-${blockIdx}`}>{renderQuizSuggestions({ data: Array.isArray(block.data) ? block.data : block?.data?.data })}</div>;
                      }
                      if (block.type === 'actions') {
                        const items = Array.isArray(block?.data?.items) ? block.data.items : msg.actions;
                        return <div key={`b-${blockIdx}`}>{renderActionCards(items)}</div>;
                      }
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
                      <p className="text-[10px] text-muted-foreground">
                        Data availability: {msg.dataAvailability}
                      </p>
                    )}
                    {Array.isArray(msg.dataSourcesUsed) && msg.dataSourcesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.dataSourcesUsed.map((source) => (
                          <span key={source} className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground">
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    {msg.lastUpdatedAt && (
                      <p className="text-[10px] text-muted-foreground">
                        Last updated: {new Date(msg.lastUpdatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                <span className="text-xs opacity-60 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-foreground" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
          />
          {recognitionRef.current && (
            <button
              onClick={toggleVoiceInput}
              disabled={loading}
              className={`px-4 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all ${
                isListening 
                  ? 'bg-destructive text-destructive-foreground animate-pulse' 
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="nf-btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
