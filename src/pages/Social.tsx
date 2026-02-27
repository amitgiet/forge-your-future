import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, UserPlus, Search, Check, X, Bell } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

const Social = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onFriendsListUpdated, onFriendRequestReceived } = useSocket(user?._id);

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'chats' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Load requests on mount to show badge
    loadRequests();
  }, [activeTab]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = onFriendsListUpdated(() => {
      if (activeTab === 'friends') {
        loadFriends();
      }
    });
    return unsubscribe;
  }, [activeTab]);

  // Listen for new friend requests
  useEffect(() => {
    const unsubscribe = onFriendRequestReceived((data) => {
      console.log('Friend request received:', data);
      loadRequests();
    });
    return unsubscribe;
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        await loadFriends();
      } else if (activeTab === 'requests') {
        await loadRequests();
      } else if (activeTab === 'chats') {
        await loadChats();
      } else if (activeTab === 'leaderboard') {
        await loadLeaderboard();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await apiService.social.getFriends();
      setFriends(response.data.data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await apiService.social.getFriendRequests();
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await apiService.social.getChats();
      setChats(response.data.data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await apiService.social.getFriendsLeaderboard();
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const response = await apiService.social.createDirectChat(friendId);
      navigate(`/chat/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    setAcceptingId(friendId);
    try {
      await apiService.social.acceptFriendRequest(friendId);
      setRequests(requests.filter(r => r.userId._id !== friendId));
      loadFriends(); // Refresh friends list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setAcceptingId(null);
    }
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
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'friends'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Requests
            {requests.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
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
            className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
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
                <div className="flex items-center gap-3 flex-1">
                  {friend.avatar ? (
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChat(friend._id)}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Chat
                </button>
              </motion.div>
            ))}

            {activeTab === 'requests' && requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="nf-card flex items-center justify-between border-2 border-primary/30 bg-primary/5"
              >
                <div className="flex items-center gap-3 flex-1">
                  {request.userId?.avatar ? (
                    <img 
                      src={request.userId.avatar} 
                      alt={request.userId?.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{request.userId?.name}</p>
                    <p className="text-sm text-muted-foreground">{request.userId?.email}</p>
                    <p className="text-xs text-primary mt-1">Sent you a friend request</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.userId?._id)}
                    disabled={acceptingId === request.userId?._id}
                    className="px-3 py-2 rounded-lg bg-green-500/20 text-green-600 text-sm font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-600 text-sm font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'chats' && chats.map((chat, index) => {
              const otherParticipant = chat.type === 'direct' 
                ? chat.participants.find((p: any) => p._id !== user?._id)
                : null;
              
              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleChatClick(chat._id)}
                  className="nf-card cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {chat.type === 'group' ? (
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-secondary" />
                      </div>
                    ) : otherParticipant?.avatar ? (
                      <img 
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-secondary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {chat.type === 'group' ? chat.name : otherParticipant?.name}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {chat.lastMessage.sender?._id === user?._id ? 'You: ' : ''}{chat.lastMessage.text}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

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
                  {user.avatar ? (
                    <img 
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}
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
              (activeTab === 'requests' && requests.length === 0) ||
              (activeTab === 'chats' && chats.length === 0) ||
              (activeTab === 'leaderboard' && leaderboard.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {activeTab === 'friends' && 'No friends yet. Add some!'}
                  {activeTab === 'requests' && 'No pending requests'}
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
