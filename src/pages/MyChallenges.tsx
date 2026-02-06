import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Flame, Trophy, Trash2, Plus, Target } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const MyChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await apiService.challenges.getUserChallenges();
      setChallenges(response.data.data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm('Delete this challenge?')) return;

    try {
      await apiService.challenges.deleteChallenge(challengeId);
      setChallenges(challenges.filter(c => c._id !== challengeId));
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Challenges</h1>
              <p className="text-sm text-muted-foreground">30-day NeuronZ practice journeys</p>
            </div>
            <button
              onClick={() => navigate('/start-practice')}
              className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Challenges List */}
        {challenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Challenges Yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              Start your first 30-day challenge and enter NeuronZ Level 1
            </p>
            <button
              onClick={() => navigate('/start-practice')}
              className="nf-btn-primary !w-auto px-8 mx-auto"
            >
              Start Challenge
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nf-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        challenge.status === 'active' ? 'bg-success/20 text-success' :
                        challenge.status === 'completed' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {challenge.status}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 capitalize">
                      {challenge.subject} • {challenge.topic}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Day {challenge.progress.currentDay}/{challenge.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-secondary" />
                        <span className="font-bold text-secondary">{challenge.progress.streak}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">
                          {challenge.progress.completedQuizzes}/{challenge.progress.totalQuizzes}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round((challenge.progress.completedDays / challenge.duration) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(challenge.progress.completedDays / challenge.duration) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {challenge.status === 'active' && (
                        <button
                          onClick={() => navigate(`/practice-session/${challenge._id}`)}
                          className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          Continue
                        </button>
                      )}
                      {challenge.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(challenge._id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyChallenges;
