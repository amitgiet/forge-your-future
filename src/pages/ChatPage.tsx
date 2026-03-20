import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string | false>(false);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { connected, joinChat, leaveChat, sendMessage, sendTyping, markAsRead, onNewMessage, onUserTyping } = useSocket(user?._id);

  // Load messages and join chat
  useEffect(() => {
    if (chatId && connected) {
      joinChat(chatId);
      loadMessages();
      markAsRead(chatId);
    }

    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, connected]);

  // Listen for new messages
  useEffect(() => {
    const cleanup = onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
    return cleanup;
  }, []);

  // Listen for typing indicators
  useEffect(() => {
    const cleanup = onUserTyping((data) => {
      if (data.userId !== user?._id) {
        setTyping(data.isTyping ? data.userId : false);
      }
    });
    return cleanup;
  }, [user]);

  const loadMessages = async () => {
    try {
      const response = await apiService.social.getMessages(chatId!);
      setMessages(response.data.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage('');
    sendTyping(chatId, false);

    try {
      // Send via socket for real-time
      sendMessage(chatId, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!chatId) return;

    sendTyping(chatId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(chatId, false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0">
        <button
          onClick={() => navigate('/app/social')}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">Chat</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-xs text-muted-foreground">
              {connected ? 'Connected' : 'Reconnecting...'}
            </p>
          </div>
        </div>
        {typing && (
          <p className="text-xs text-muted-foreground animate-pulse">typing...</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender._id === user?._id;
            return (
              <motion.div
                key={message._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1 px-3">
                      {message.sender.name}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-3">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border sticky bottom-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || !connected}
            className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
