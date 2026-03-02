import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, Mic, MicOff, Download, TrendingUp, BookOpen, Target, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { BarChartComponent, PieChartComponent } from './AICharts';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  chartData?: { type: string; chartType: string; data: any[]; message: string };
  quizData?: { type: string; data: Array<{ quizId?: string; lineId?: string; topic: string; subject: string; chapter: string; reason?: string }> };
  toolsUsed?: string[];
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const CACHE_KEY = 'aiChat.cache.v1';
  const MAX_UI_MESSAGES = 15;

  const persistCache = (nextChatId: string | null, nextMessages: Message[]) => {
    try {
      const trimmed = nextMessages.slice(-MAX_UI_MESSAGES);
      const payload = {
        chatId: nextChatId,
        messages: trimmed.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString()
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
      // Decode HTML entities first
      const decodedText = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'");
      
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
    } catch (e) {
      console.error('Parse error:', e, text.substring(0, 200));
    }
    return { chartData: null, cleanText: text, quizData: null };
  };

  // Hydrate from cache, then reconcile with DB (last 15)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { chatId?: string | null; messages?: Array<{ role: 'user' | 'ai'; content: string; timestamp: string }> };
        if (parsed.chatId) setChatId(parsed.chatId);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const hydrated: Message[] = parsed.messages.map((m) => {
            const ts = new Date(m.timestamp);
            if (m.role === 'ai') {
              const { chartData, cleanText, quizData } = parseChartData(m.content);
              return { role: 'ai', content: cleanText || m.content, timestamp: ts, chartData, quizData };
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
    persistCache(chatId, messages);
  }, [chatId, messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai-chat/message', {
        message: input,
        chatId
      });

      const nextChatId = response.data.data.chatId;
      if (!chatId && nextChatId) setChatId(nextChatId);

      const { chartData, cleanText, quizData } = parseChartData(response.data.data.message);

      const aiMessage: Message = {
        role: 'ai',
        content: cleanText || response.data.data.message,
        timestamp: new Date(),
        chartData,
        quizData,
        toolsUsed: response.data.data.toolsUsed
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
        persistCache(newId, []);
      } catch {
        setMessages([]);
        setChatId(null);
        persistCache(null, []);
      }
    })();
  };

  const quickQuestions = [
    { icon: TrendingUp, text: "What are my weak points?", color: "text-red-400" },
    { icon: BookOpen, text: "Review my last quiz", color: "text-blue-400" },
    { icon: Target, text: "What should I study today?", color: "text-green-400" }
  ];

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
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-foreground/90 italic">$1</em>')
                      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-xs">$1</code>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mt-3 mb-2 text-foreground">$1</h3>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-foreground">$1</h2>')
                      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-2 text-foreground">$1</h1>')
                      .replace(/^- (.*$)/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
                      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
                      .replace(/\n/g, '<br/>')
                  }} />
                </div>
                {msg.chartData && renderChart(msg.chartData)}
                {msg.quizData && renderQuizSuggestions(msg.quizData)}
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
