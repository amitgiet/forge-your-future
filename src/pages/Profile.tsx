import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Flame, Target, BookOpen, Award, Globe, Crown, Star, Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();

  const stats = [
    { icon: Flame, label: t('dashboard.streak'), value: '7 days', color: 'nf-stat-icon-warning' },
    { icon: BookOpen, label: t('profile.quizzesCompleted'), value: '45', color: 'nf-stat-icon-primary' },
    { icon: Target, label: t('profile.accuracy'), value: '78%', color: 'nf-stat-icon-success' },
    { icon: Award, label: t('dashboard.score'), value: '2,450', color: 'nf-stat-icon-secondary' },
  ];

  const achievements = [
    { icon: '🔥', label: '7 Day Streak', unlocked: true },
    { icon: '📚', label: 'First Quiz', unlocked: true },
    { icon: '🎯', label: '100% Accuracy', unlocked: false },
    { icon: '🏆', label: 'Top 10%', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nf-card-achievement text-center mb-6"
        >
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center border-4 border-white shadow-elevated">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-warning flex items-center justify-center border-2 border-white">
              <Star className="w-4 h-4 text-warning-foreground" />
            </div>
          </div>
          <h1 className="nf-heading text-2xl text-foreground">NEET Aspirant</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="nf-badge nf-badge-outline">Free Plan</span>
            <span className="nf-badge nf-badge-secondary">Level 12</span>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nf-card mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              <span className="nf-heading text-foreground">2,450 XP</span>
            </div>
            <span className="text-sm text-muted-foreground">550 to Level 13</span>
          </div>
          <div className="nf-progress-bar">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '82%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Language Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="nf-card mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="nf-stat-icon nf-stat-icon-secondary">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground">{t('profile.language')}</span>
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border-2 border-border">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                हिं
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="nf-card mb-6"
        >
          <h3 className="nf-heading text-foreground mb-4">{t('profile.stats')}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="nf-card-stat"
              >
                <div className={`nf-stat-icon ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="nf-card mb-6"
        >
          <h3 className="nf-heading text-foreground mb-4">Achievements</h3>
          
          <div className="grid grid-cols-4 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`text-center py-3 rounded-xl border-2 ${
                  achievement.unlocked 
                    ? 'bg-warning/10 border-warning/30' 
                    : 'bg-muted/50 border-border opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className="text-[10px] text-foreground font-medium leading-tight">{achievement.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="nf-card-achievement"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning to-primary flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="nf-heading text-foreground">Go Pro</h3>
              <p className="text-sm text-muted-foreground">Unlimited revisions & features</p>
            </div>
          </div>
          <button className="nf-btn-secondary">
            <Crown className="w-5 h-5" />
            Upgrade - ₹149/mo
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
