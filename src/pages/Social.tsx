import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, UserPlus, Search } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const Social = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'chats' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const response = await apiService.social.getFriends();
        setFriends(response.data.data);
      } else if (activeTab === 'chats') {
        const response = await apiService.social.getChats();
        setChats(response.data.data);
      } else if (activeTab === 'leaderboard') {
        const response = await apiService.social.getFriendsLeaderboard();
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Social</h1>
            <button
              onClick={() => navigate('/add-friend')}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Friends
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'chats'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Chats
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Rank
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'friends' && friends.map((friend, index) => (
              <motion.div
                key={friend._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="nf-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/chat/${friend._id}`)}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
                >
                  Chat
                </button>
              </motion.div>
            ))}

            {activeTab === 'chats' && chats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleChatClick(chat._id)}
                className="nf-card cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {chat.type === 'group' ? chat.name : chat.participants.find((p: any) => p._id !== chat._id)?.name}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {chat.lastMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'leaderboard' && leaderboard.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`nf-card ${user.isCurrentUser ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    user.rank === 1 ? 'bg-warning/20 text-warning' :
                    user.rank === 2 ? 'bg-muted text-foreground' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-muted/50 text-muted-foreground'
                  }`}>
                    #{user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {user.name} {user.isCurrentUser && '(You)'}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.xp} XP • {user.streak} day streak</p>
                  </div>
                  {user.rank === 1 && <Trophy className="w-6 h-6 text-warning" />}
                </div>
              </motion.div>
            ))}

            {((activeTab === 'friends' && friends.length === 0) ||
              (activeTab === 'chats' && chats.length === 0) ||
              (activeTab === 'leaderboard' && leaderboard.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {activeTab === 'friends' && 'No friends yet. Add some!'}
                  {activeTab === 'chats' && 'No chats yet. Start chatting!'}
                  {activeTab === 'leaderboard' && 'Add friends to see leaderboard'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Social;
