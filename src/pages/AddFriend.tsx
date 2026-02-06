import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { apiService } from '../lib/apiService';

const AddFriend = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await apiService.social.searchUsers(query);
      setResults(response.data.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    setSending(friendId);
    try {
      await apiService.social.sendFriendRequest(friendId);
      alert('Friend request sent!');
      setResults(results.filter(r => r._id !== friendId));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(null);
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
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/social')}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Add Friend</h1>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by email or phone..."
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="nf-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(user._id)}
                  disabled={sending === user._id}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50"
                >
                  {sending === user._id ? 'Sending...' : 'Add'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Search for friends by email or phone</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriend;
