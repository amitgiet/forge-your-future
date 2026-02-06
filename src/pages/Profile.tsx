import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Flame, Target, BookOpen, Award, Globe, Crown, Zap, LogOut, Edit2, Save } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { apiService } from '@/lib/apiService';

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetYear: '',
    studyHours: '',
    boardPercentage: '',
    mockScore: '',
    weakSubjects: [] as string[]
  });

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiService.auth.getProfile();
      if (response.data.success) {
        const data = response.data.data;
        setProfileData(data);
        setFormData({
          name: data.name || '',
          targetYear: data.profile?.targetYear || '2026',
          studyHours: data.profile?.studyHoursPerDay ? `${data.profile.studyHoursPerDay}-${data.profile.studyHoursPerDay + 2}` : '4-6',
          boardPercentage: data.profile?.boardPercentage || '75-90',
          mockScore: data.profile?.mockScore || '',
          weakSubjects: data.profile?.weakSubjects || []
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiService.auth.updateProfile({
        name: formData.name,
        profile: {
          targetYear: formData.targetYear,
          studyHoursPerDay: parseInt(formData.studyHours.split('-')[0]),
          boardPercentage: formData.boardPercentage,
          mockScore: formData.mockScore,
          weakSubjects: formData.weakSubjects
        }
      });
      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nf-card text-center mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Profile Details</h2>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border-2 border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors"
            >
              {editing ? (
                <>{loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</> }</>
              ) : (
                <><Edit2 className="w-4 h-4" /> Edit</>
              )}
            </button>
          </div>

          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center border-4 border-white shadow-elevated">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>

          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-2xl font-bold text-center w-full px-4 py-2 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
          ) : (
            <h1 className="nf-heading text-2xl text-foreground">{profileData?.name || 'NEET Aspirant'}</h1>
          )}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* Profile Info */}
        {editing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Target Year</label>
              <div className="grid grid-cols-3 gap-2">
                {['2027', '2026', 'Dropper'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setFormData({ ...formData, targetYear: year })}
                    className={`py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
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
              <label className="block text-sm font-medium text-foreground mb-2">Study Hours</label>
              <div className="grid grid-cols-3 gap-2">
                {['2-3', '4-6', '6+'].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setFormData({ ...formData, studyHours: hours })}
                    className={`py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Board %</label>
              <div className="grid grid-cols-2 gap-2">
                {['<60%', '60-75%', '75-90%', '90+%'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setFormData({ ...formData, boardPercentage: range })}
                    className={`py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
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
              <label className="block text-sm font-medium text-foreground mb-2">Mock Score</label>
              <input
                type="text"
                value={formData.mockScore}
                onChange={(e) => setFormData({ ...formData, mockScore: e.target.value })}
                placeholder="450/720"
                className="w-full px-4 py-2 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Weak Subjects</label>
              <div className="space-y-2">
                {['Physics', 'Chemistry', 'Biology'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setFormData({
                      ...formData,
                      weakSubjects: toggleArrayItem(formData.weakSubjects, subject)
                    })}
                    className={`w-full py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card mb-6"
          >
            <h3 className="font-bold text-foreground mb-3">Academic Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Year:</span>
                <span className="font-semibold text-foreground">{profileData?.profile?.targetYear || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Study Hours:</span>
                <span className="font-semibold text-foreground">{profileData?.profile?.studyHoursPerDay || 6}hr/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Board %:</span>
                <span className="font-semibold text-foreground">{profileData?.profile?.boardPercentage || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mock Score:</span>
                <span className="font-semibold text-foreground">{profileData?.profile?.mockScore || 'Not attempted'}</span>
              </div>
              {profileData?.profile?.weakSubjects?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weak Subjects:</span>
                  <span className="font-semibold text-destructive">{profileData.profile.weakSubjects.join(', ')}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="nf-card mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              <span className="nf-heading text-foreground">{profileData?.gamification?.totalXP || 0} XP</span>
            </div>
            <span className="text-sm text-muted-foreground">Level {profileData?.gamification?.level || 1}</span>
          </div>
          <div className="nf-progress-bar">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${((profileData?.gamification?.totalXP || 0) % 1000) / 10}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
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
            <motion.div className="nf-card-stat">
              <div className="nf-stat-icon nf-stat-icon-warning">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{profileData?.gamification?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.streak')}</p>
              </div>
            </motion.div>

            <motion.div className="nf-card-stat">
              <div className="nf-stat-icon nf-stat-icon-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{profileData?.analytics?.totalMocksAttempted || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Mocks</p>
              </div>
            </motion.div>

            <motion.div className="nf-card-stat">
              <div className="nf-stat-icon nf-stat-icon-success">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{profileData?.analytics?.overallAccuracy || 0}%</p>
                <p className="text-xs text-muted-foreground font-medium">{t('profile.accuracy')}</p>
              </div>
            </motion.div>

            <motion.div className="nf-card-stat">
              <div className="nf-stat-icon nf-stat-icon-secondary">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{profileData?.gamification?.coins || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Coins</p>
              </div>
            </motion.div>
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
        {profileData?.subscription?.plan === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nf-card-achievement mb-6"
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
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={logout}
            className="w-full nf-card hover:border-destructive/50 transition-colors flex items-center justify-center gap-2 text-destructive font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
