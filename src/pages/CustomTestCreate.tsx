import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];
const CHAPTERS = {
  Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Physiology']
};

export default function CustomTestCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subjects: [] as string[],
    chapters: [] as string[],
    questionCount: 30,
    duration: 45,
    difficulty: 'mixed',
    ncertOnly: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects, chapters: [] });
  };

  const handleChapterToggle = (chapter: string) => {
    const newChapters = formData.chapters.includes(chapter)
      ? formData.chapters.filter(c => c !== chapter)
      : [...formData.chapters, chapter];
    setFormData({ ...formData, chapters: newChapters });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.tests.createCustomTest(formData);
      const testId = res.data.data._id;
      
      const startRes = await apiService.tests.startTest(testId);
      const attemptId = startRes.data.data.attemptId;
      navigate(`/test/session/${attemptId}`);
    } catch (error: any) {
      console.error('Failed to create test:', error);
      alert(error.response?.data?.message || 'Failed to create custom test');
    } finally {
      setLoading(false);
    }
  };

  const availableChapters = formData.subjects.flatMap(subject => 
    CHAPTERS[subject as keyof typeof CHAPTERS]?.map(ch => ({ subject, chapter: ch })) || []
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/tests')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="nf-heading text-2xl nf-gradient-text mb-1">Create Custom Test</h1>
          <p className="text-sm text-muted-foreground">Configure your personalized test</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Test Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card"
          >
            <label className="block text-foreground font-bold text-sm mb-2">Test Title (Optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="My Custom Test"
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </motion.div>

          {/* Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nf-card"
          >
            <label className="block text-foreground font-bold text-sm mb-3">Select Subjects *</label>
            <div className="flex gap-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectToggle(subject)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    formData.subjects.includes(subject)
                      ? 'nf-gradient text-white shadow-card'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Chapters */}
          {availableChapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="nf-card"
            >
              <label className="block text-foreground font-bold text-sm mb-3">Select Chapters (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {availableChapters.map(({ subject, chapter }) => (
                  <button
                    key={`${subject}-${chapter}`}
                    type="button"
                    onClick={() => handleChapterToggle(chapter)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      formData.chapters.includes(chapter)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nf-card"
          >
            <h3 className="text-foreground font-bold text-sm mb-4">Test Configuration</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-muted-foreground text-xs font-semibold mb-2">Questions</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-muted-foreground text-xs font-semibold mb-2">Duration (min)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-muted-foreground text-xs font-semibold mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/50 rounded-xl">
              <input
                type="checkbox"
                checked={formData.ncertOnly}
                onChange={(e) => setFormData({ ...formData, ncertOnly: e.target.checked })}
                className="w-5 h-5 rounded border-border bg-input text-primary focus:ring-primary"
              />
              <span className="text-foreground font-semibold text-sm">NCERT Questions Only</span>
            </label>
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || formData.subjects.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 nf-gradient rounded-xl text-white font-black text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-card"
          >
            {loading ? (
              'Creating Test...'
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Create & Start Test
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
