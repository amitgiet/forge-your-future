import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Target, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const SUBJECTS = ['physics', 'chemistry', 'biology', 'mathematics'];

const CreateLearningPath = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dailyGoal, setDailyGoal] = useState(10);
  const [goals, setGoals] = useState<Array<{ topic: string; subject: string; targetDate?: string }>>([
    { topic: '', subject: 'physics' }
  ]);

  const addGoal = () => {
    setGoals([...goals, { topic: '', subject: 'physics' }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: string, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const handleCreate = async () => {
    if (!title.trim() || goals.some(g => !g.topic.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.learningPaths.createPath({
        title,
        description,
        goals: goals.map(g => ({
          topic: g.topic,
          subject: g.subject,
          targetDate: g.targetDate ? new Date(g.targetDate) : undefined
        })),
        dailyGoal
      });

      if (response.data.success) {
        navigate(`/app/learning-path/${response.data.data._id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create learning path');
    } finally {
      setLoading(false);
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Learning Path</h1>
              <p className="text-sm text-muted-foreground">AI will generate personalized content</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Title */}
          <div className="nf-card">
            <label className="block text-sm font-medium text-foreground mb-2">
              Path Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master Thermodynamics"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="nf-card">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Daily Goal */}
          <div className="nf-card">
            <label className="block text-sm font-medium text-foreground mb-2">
              Daily Goal (Lines per day)
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 10)}
              min={1}
              max={100}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Goals */}
          <div className="nf-card">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Learning Goals *
              </label>
              <button
                onClick={addGoal}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Goal
              </button>
            </div>

            <div className="space-y-3">
              {goals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={goal.topic}
                      onChange={(e) => updateGoal(index, 'topic', e.target.value)}
                      placeholder="e.g., Laws of Thermodynamics"
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {goals.length > 1 && (
                      <button
                        onClick={() => removeGoal(index)}
                        className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={goal.subject}
                      onChange={(e) => updateGoal(index, 'subject', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                    >
                      {SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={goal.targetDate || ''}
                      onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="nf-btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="nf-btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Path
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CreateLearningPath;

