import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Target, TrendingUp, Trash2 } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const MyLearningPaths = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<any[]>([]);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      const response = await apiService.learningPaths.getUserPaths();
      setPaths(response.data.data);
    } catch (error) {
      console.error('Error loading paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pathId: string) => {
    if (!confirm('Delete this learning path?')) return;

    try {
      await apiService.learningPaths.deletePath(pathId);
      setPaths(paths.filter(p => p._id !== pathId));
    } catch (error) {
      console.error('Error deleting path:', error);
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
              <h1 className="text-2xl font-bold text-foreground">My Learning Paths</h1>
              <p className="text-sm text-muted-foreground">Custom AI-powered learning journeys</p>
            </div>
            <button
              onClick={() => navigate('/create-learning-path')}
              className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Paths List */}
        {paths.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Learning Paths Yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              Create your first custom learning path and let AI generate personalized content
            </p>
            <button
              onClick={() => navigate('/create-learning-path')}
              className="nf-btn-primary !w-auto px-8 mx-auto"
            >
              Create Learning Path
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {paths.map((path, index) => (
              <motion.div
                key={path._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nf-card hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/learning-path/${path._id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{path.title}</h3>
                    {path.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {path.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{path.progress.completedItems}/{path.progress.totalItems}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(path.progress.completedItems / path.progress.totalItems) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="flex flex-wrap gap-2">
                      {path.goals.slice(0, 3).map((goal: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground border border-border"
                        >
                          {goal.topic}
                        </span>
                      ))}
                      {path.goals.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground">
                          +{path.goals.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(path._id);
                    }}
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

export default MyLearningPaths;
