import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Trophy, UserPlus, Search, Check, X, Bell, ChevronRight, Crown, Medal, Award } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

const tabs = [
  { key: 'friends', label: 'Friends', icon: Users },
  { key: 'requests', label: 'Requests', icon: Bell },
  { key: 'chats', label: 'Chats', icon: MessageCircle },
  { key: 'leaderboard', label: 'Rank', icon: Trophy },
] as const;

type TabKey = typeof tabs[number]['key'];

const Social = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onFriendsListUpdated, onFriendRequestReceived } = useSocket(user?._id);

  const [activeTab, setActiveTab] = useState<TabKey>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => { loadData(); loadRequests(); }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onFriendsListUpdated(() => { if (activeTab === 'friends') loadFriends(); });
    return unsubscribe;
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onFriendRequestReceived(() => { loadRequests(); });
    return unsubscribe;
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') await loadFriends();
      else if (activeTab === 'requests') await loadRequests();
      else if (activeTab === 'chats') await loadChats();
      else if (activeTab === 'leaderboard') await loadLeaderboard();
    } catch (error) { console.error('Error loading data:', error); }
    finally { setLoading(false); }
  };

  const loadFriends = async () => { try { const r = await apiService.social.getFriends(); setFriends(r.data.data || []); } catch (e) { console.error(e); } };
  const loadRequests = async () => { try { const r = await apiService.social.getFriendRequests(); setRequests(r.data.data || []); } catch (e) { console.error(e); } };
  const loadChats = async () => { try { const r = await apiService.social.getChats(); setChats(r.data.data || []); } catch (e) { console.error(e); } };
  const loadLeaderboard = async () => { try { const r = await apiService.social.getFriendsLeaderboard(); setLeaderboard(r.data.data || []); } catch (e) { console.error(e); } };

  const handleChatClick = (chatId: string) => navigate(`/chat/${chatId}`);
  const handleStartChat = async (friendId: string) => {
    try { const r = await apiService.social.createDirectChat(friendId); navigate(`/chat/${r.data.data._id}`); } catch (e) { console.error(e); }
  };

  const handleAcceptRequest = async (friendId: string) => {
    setAcceptingId(friendId);
    try {
      await apiService.social.acceptFriendRequest(friendId);
      setRequests(requests.filter(r => r.userId._id !== friendId));
      loadFriends();
    } catch (e) { console.error(e); }
    finally { setAcceptingId(null); }
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-warning" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-muted-foreground" />;
    if (rank === 3) return <Award className="w-4 h-4 text-warning" />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  const emptyMessages: Record<TabKey, { icon: React.ReactNode; text: string; action?: string }> = {
    friends: { icon: <Users className="w-8 h-8" />, text: 'No friends yet', action: 'Add your first friend!' },
    requests: { icon: <Bell className="w-8 h-8" />, text: 'No pending requests', action: 'All caught up 🎉' },
    chats: { icon: <MessageCircle className="w-8 h-8" />, text: 'No chats yet', action: 'Start chatting with friends!' },
    leaderboard: { icon: <Trophy className="w-8 h-8" />, text: 'No rankings yet', action: 'Add friends to compete!' },
  };

  const isEmpty = (activeTab === 'friends' && friends.length === 0) ||
    (activeTab === 'requests' && requests.length === 0) ||
    (activeTab === 'chats' && chats.length === 0) ||
    (activeTab === 'leaderboard' && leaderboard.length === 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground nf-heading">👥 Social</h1>
              <p className="text-xs text-muted-foreground">Connect & compete with friends</p>
            </div>
            <button
              onClick={() => navigate('/add-friend')}
              className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' }}
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden min-[340px]:inline">{tab.label}</span>
                  {tab.key === 'requests' && requests.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {requests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
              {emptyMessages[activeTab].icon}
            </div>
            <p className="text-sm font-semibold text-foreground">{emptyMessages[activeTab].text}</p>
            <p className="text-xs text-muted-foreground mt-1">{emptyMessages[activeTab].action}</p>
            {activeTab === 'friends' && (
              <button
                onClick={() => navigate('/add-friend')}
                className="mt-4 h-9 px-5 rounded-xl text-xs font-semibold text-primary-foreground"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                Find Friends
              </button>
            )}
          </motion.div>
        ) : (
          /* Content */
          <div className="space-y-2.5">
            <AnimatePresence mode="wait">
              {/* ===== FRIENDS ===== */}
              {activeTab === 'friends' && friends.map((friend, idx) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-xl object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                  </div>
                  <button
                    onClick={() => handleStartChat(friend._id)}
                    className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                  </button>
                </motion.div>
              ))}

              {/* ===== REQUESTS ===== */}
              {activeTab === 'requests' && requests.map((request, idx) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-xl border-2 border-primary/20 bg-card p-3"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {request.userId?.avatar ? (
                      <img src={request.userId.avatar} alt={request.userId?.name} className="w-11 h-11 rounded-xl object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{request.userId?.name}</p>
                      <p className="text-xs text-primary">Wants to be friends</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.userId?._id)}
                      disabled={acceptingId === request.userId?._id}
                      className="flex-1 h-9 rounded-xl text-xs font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'var(--gradient-success)' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button className="flex-1 h-9 rounded-xl border border-border bg-muted text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* ===== CHATS ===== */}
              {activeTab === 'chats' && chats.map((chat, idx) => {
                const other = chat.type === 'direct' ? chat.participants.find((p: any) => p._id !== user?._id) : null;
                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleChatClick(chat._id)}
                    className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all group"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    {chat.type === 'group' ? (
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-secondary" />
                      </div>
                    ) : other?.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-11 h-11 rounded-xl object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-secondary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {chat.type === 'group' ? chat.name : other?.name}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage.sender?._id === user?._id ? 'You: ' : ''}{chat.lastMessage.text}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </motion.div>
                );
              })}

              {/* ===== LEADERBOARD ===== */}
              {activeTab === 'leaderboard' && leaderboard.map((u, idx) => (
                <motion.div
                  key={u.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-xl border bg-card p-3 flex items-center gap-3 ${
                    u.isCurrentUser ? 'border-primary/40 bg-primary/5' : 'border-border'
                  } ${u.rank <= 3 ? '' : ''}`}
                  style={{ boxShadow: u.rank <= 3 ? 'var(--shadow-card)' : 'var(--shadow-sm)' }}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    u.rank === 1 ? 'bg-warning/15' :
                    u.rank === 2 ? 'bg-muted' :
                    u.rank === 3 ? 'bg-warning/10' :
                    'bg-muted/50'
                  }`}>
                    {rankIcon(u.rank)}
                  </div>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {u.name} {u.isCurrentUser && <span className="text-primary text-xs">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-primary">{u.xp} XP</span>
                      <span>•</span>
                      <span>🔥 {u.streak}d streak</span>
                    </div>
                  </div>
                  {u.rank === 1 && <Trophy className="w-5 h-5 text-warning flex-shrink-0" />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Social;
