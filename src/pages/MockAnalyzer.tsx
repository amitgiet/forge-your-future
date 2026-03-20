import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Upload, FileText, TrendingDown, Trophy, Calendar, RotateCcw, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const mockWeaknesses = [
  { chapter: 'Cell Division', accuracy: 45, questions: 8 },
  { chapter: 'Genetics', accuracy: 52, questions: 12 },
  { chapter: 'Plant Physiology', accuracy: 58, questions: 6 },
  { chapter: 'Human Physiology', accuracy: 61, questions: 10 },
];

const MockAnalyzer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleUpload = () => {
    setHasUploaded(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button onClick={() => navigate('/app/dashboard')} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="nf-heading text-xl text-foreground">{t('mock.title')}</h1>
            <p className="text-xs text-muted-foreground">AI-powered analysis</p>
          </div>
        </motion.div>

        {!hasUploaded ? (
          /* Upload Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div
              onClick={handleUpload}
              className="nf-card border-2 border-dashed border-primary/40 cursor-pointer hover:border-primary transition-all hover:shadow-glow-primary"
            >
              <div className="flex flex-col items-center py-12">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="nf-heading text-lg text-foreground mb-2">
                  {t('mock.upload')}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Upload your mock test PDF and let AI analyze your weaknesses
                </p>
              </div>
            </div>

            <div className="mt-6 nf-card-stat">
              <div className="nf-stat-icon nf-stat-icon-secondary">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Supports: PDF, Images</span>
            </div>
          </motion.div>
        ) : (
          /* Results Section */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Rank Card */}
            <motion.div
              className="nf-card-achievement"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{t('mock.rank')}</p>
                  <p className="text-4xl font-black nf-gradient-text">12,450</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your mock test performance
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-warning" />
                </div>
              </div>
            </motion.div>

            {/* Score Stats */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                className="nf-card text-center py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-2xl font-black text-foreground">156</p>
                <p className="text-xs text-muted-foreground font-medium">Correct</p>
              </motion.div>
              <motion.div
                className="nf-card text-center py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-2xl font-black text-destructive">44</p>
                <p className="text-xs text-muted-foreground font-medium">Wrong</p>
              </motion.div>
              <motion.div
                className="nf-card text-center py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-2xl font-black text-primary">78%</p>
                <p className="text-xs text-muted-foreground font-medium">Accuracy</p>
              </motion.div>
            </div>

            {/* Weakness Map */}
            <motion.div
              className="nf-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="nf-stat-icon nf-stat-icon-primary !w-8 !h-8">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h3 className="nf-heading text-foreground">{t('mock.weaknesses')}</h3>
              </div>
              
              <div className="space-y-4">
                {mockWeaknesses.map((weakness, index) => (
                  <motion.div
                    key={weakness.chapter}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-foreground">{weakness.chapter}</p>
                      <span className={`nf-badge text-xs ${
                        weakness.accuracy < 50 
                          ? 'bg-destructive/10 text-destructive border-destructive/30' 
                          : weakness.accuracy < 60 
                          ? 'bg-warning/10 text-warning-foreground border-warning/30'
                          : 'bg-accent/10 text-accent border-accent/30'
                      }`}>
                        {weakness.accuracy}%
                      </span>
                    </div>
                    <div className="nf-progress-bar !h-2">
                      <motion.div
                        className={`h-full rounded-full ${
                          weakness.accuracy < 50 
                            ? 'bg-destructive' 
                            : weakness.accuracy < 60 
                            ? 'bg-warning'
                            : 'bg-accent'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${weakness.accuracy}%` }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button className="nf-btn-primary">
                <Calendar className="w-5 h-5" />
                {t('mock.dailyFix')}
              </button>
              <button className="nf-btn-outline">
                <RotateCcw className="w-5 h-5" />
                {t('mock.retryWeak')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MockAnalyzer;

