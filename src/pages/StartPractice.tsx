import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const SUBJECTS = [
  { id: 'physics', name: 'Physics', color: 'bg-blue-500' },
  { id: 'chemistry', name: 'Chemistry', color: 'bg-green-500' },
  { id: 'biology', name: 'Biology', color: 'bg-red-500' },
  { id: 'mathematics', name: 'Mathematics', color: 'bg-purple-500' }
];

const POPULAR_TOPICS = {
  physics: ['Thermodynamics', 'Electrostatics', 'Optics', 'Modern Physics', 'Mechanics'],
  chemistry: ['Organic Chemistry', 'Chemical Bonding', 'Equilibrium', 'Electrochemistry', 'Coordination'],
  biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'],
  mathematics: ['Calculus', 'Algebra', 'Trigonometry', 'Vectors', 'Probability']
};

const StartPractice = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    const topic = customTopic || selectedTopic;
    
    if (!selectedSubject || !topic) {
      alert('Please select subject and topic');
      return;
    }

    setLoading(true);
    try {
      // Create challenge for this topic
      const response = await apiService.challenges.createChallenge({
        title: `Master ${topic}`,
        topic,
        subject: selectedSubject,
        duration: 30
      });

      if (response.data.success) {
        navigate(`/practice-session/${response.data.data._id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start practice');
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
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Start NeuronZ Practice</h1>
              <p className="text-sm text-muted-foreground">Enter Level 1 with 100 MCQs</p>
            </div>
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nf-card mb-6"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            How NeuronZ Works
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Practice 100 MCQs → Enter Level 1</p>
            <p>• Correct answers unlock next levels (L2→L3→L4→L5→L6→L7)</p>
            <p>• Intervals: 24h → 3d → 5d → 7d → 10d → 15d → 30d</p>
            <p>• System brings questions back exactly when you're about to forget</p>
          </div>
        </motion.div>

        {/* Subject Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Select Subject</h3>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((subject) => (
              <motion.button
                key={subject.id}
                onClick={() => {
                  setSelectedSubject(subject.id);
                  setSelectedTopic('');
                  setCustomTopic('');
                }}
                className={`nf-card p-4 text-left transition-all ${
                  selectedSubject === subject.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-10 h-10 rounded-xl ${subject.color} flex items-center justify-center mb-2`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-foreground">{subject.name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Topic Selection */}
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h3 className="font-semibold text-foreground mb-3">Select Topic</h3>
            <div className="space-y-2 mb-4">
              {POPULAR_TOPICS[selectedSubject as keyof typeof POPULAR_TOPICS].map((topic) => (
                <motion.button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCustomTopic('');
                  }}
                  className={`w-full nf-card p-3 text-left transition-all ${
                    selectedTopic === topic
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{topic}</span>
                    {selectedTopic === topic && (
                      <Target className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="nf-card">
              <label className="block text-sm font-medium text-foreground mb-2">
                Or enter custom topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  setSelectedTopic('');
                }}
                placeholder="e.g., Photoelectric Effect"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {selectedSubject && (selectedTopic || customTopic) && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleStart}
            disabled={loading}
            className="nf-btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Starting...</>
            ) : (
              <>
                Start 30-Day Challenge
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default StartPractice;
