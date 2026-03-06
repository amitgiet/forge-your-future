import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Flame, Target, ChevronRight, Lock } from 'lucide-react';
import { apiService } from '../lib/apiService';

const ActiveChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await apiService.challenges.getUserChallenges();
      setChallenges(response.data.data.filter((c: any) => c.status === 'active'));
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || challenges.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="nf-heading text-lg text-foreground mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Active Challenges
      </h3>
      <div className="space-y-3">
        {challenges.map((challenge, index) => {
          const todaySchedule = challenge.dailySchedule.find((s: any) => 
            s.isUnlocked && !s.isCompleted
          );
          
          return (
            <motion.div
              key={challenge._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/practice-session/${challenge._id}`)}
              className="nf-card cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {challenge.subject}
                    </span>
                  </div>
                  
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
                  </div>

                  <div className="mb-2">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(challenge.progress.completedDays / challenge.duration) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {todaySchedule ? (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">
                        Today: {todaySchedule.completedQuizzes}/{todaySchedule.targetQuizzes} completed
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Complete previous day to unlock
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveChallenges;
