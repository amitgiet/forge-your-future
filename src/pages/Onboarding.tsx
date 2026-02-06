import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, User, BookOpen, Target } from 'lucide-react';
import { apiService } from '@/lib/apiService';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    targetYear: '2026',
    studyHours: '4-6',
    boardPercentage: '75-90',
    mockScore: '',
    weakSubjects: [] as string[],
    studyStyle: [] as string[]
  });

  const handleNext = () => {
    if (step < 3) {
      handleStepChange(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.auth.updateOnboarding({
        step: 3,
        completed: true,
        data: {
          targetYear: formData.targetYear,
          studyHoursPerDay: parseInt(formData.studyHours.split('-')[0]),
          boardPercentage: formData.boardPercentage,
          mockScore: formData.mockScore,
          weakSubjects: formData.weakSubjects,
          studyStyle: formData.studyStyle
        }
      });
      
      if (formData.name) {
        await apiService.auth.updateProfile({ name: formData.name });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = async (newStep: number) => {
    if (newStep < step) {
      setStep(newStep);
      return;
    }
    
    try {
      await apiService.auth.updateOnboarding({
        step: newStep,
        completed: false
      });
      setStep(newStep);
    } catch (error) {
      console.error('Step update error:', error);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="nf-safe-area p-6 max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm font-bold text-primary">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="nf-progress-bar">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Basic Profile</h1>
                  <p className="text-sm text-muted-foreground">Let's get to know you</p>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Raj Kumar"
                    className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">NEET Target Year *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['2027', '2026', 'Dropper'].map((year) => (
                      <button
                        key={year}
                        onClick={() => setFormData({ ...formData, targetYear: year })}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          formData.targetYear === year
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Daily Study Hours *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['2-3', '4-6', '6+'].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setFormData({ ...formData, studyHours: hours })}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          formData.studyHours === hours
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        {hours}hr
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Academic Snapshot</h1>
                  <p className="text-sm text-muted-foreground">Your current performance</p>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current % in Boards</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['<60%', '60-75%', '75-90%', '90+%'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setFormData({ ...formData, boardPercentage: range })}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          formData.boardPercentage === range
                            ? 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Mock Test Score</label>
                  <input
                    type="text"
                    value={formData.mockScore}
                    onChange={(e) => setFormData({ ...formData, mockScore: e.target.value })}
                    placeholder="450/720"
                    className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Weakest Subjects</label>
                  <div className="space-y-2">
                    {['Physics', 'Chemistry', 'Biology'].map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setFormData({
                          ...formData,
                          weakSubjects: toggleArrayItem(formData.weakSubjects, subject)
                        })}
                        className={`w-full py-3 rounded-xl border-2 font-semibold transition-all text-left px-4 ${
                          formData.weakSubjects.includes(subject)
                            ? 'bg-destructive/10 border-destructive text-destructive'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        {formData.weakSubjects.includes(subject) && '✓ '}{subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Study Preferences</h1>
                  <p className="text-sm text-muted-foreground">Customize your learning</p>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Study Style</label>
                  <div className="space-y-2">
                    {[
                      { id: 'pyq', label: 'PYQs first', icon: '📝' },
                      { id: 'ncert', label: 'NCERT line-by-line', icon: '📚' },
                      { id: 'blitz', label: '15min blitz quizzes', icon: '⚡' },
                      { id: 'shield', label: 'Reels distraction (need Shield)', icon: '🛡️' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({
                          ...formData,
                          studyStyle: toggleArrayItem(formData.studyStyle, style.id)
                        })}
                        className={`w-full py-3 rounded-xl border-2 font-semibold transition-all text-left px-4 flex items-center gap-3 ${
                          formData.studyStyle.includes(style.id)
                            ? 'bg-success/10 border-success text-success'
                            : 'bg-card border-border text-foreground'
                        }`}
                      >
                        <span className="text-xl">{style.icon}</span>
                        <span className="flex-1">{style.label}</span>
                        {formData.studyStyle.includes(style.id) && <span className="text-lg">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="nf-btn-outline flex-1"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.name)}
            className="nf-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? 'Setting up...' : step === 3 ? 'START MY PLAN 🚀' : 'Next'}
            {!loading && step < 3 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
