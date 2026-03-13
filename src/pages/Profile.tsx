import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Flame, Target, BookOpen, Award, Globe, Crown, Zap, LogOut, Edit2, Save, ChevronLeft, Shield, X, Loader2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { apiService } from '@/lib/apiService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [pricing, setPricing] = useState({
    baseAmountPaise: 14900,
    discountAmountPaise: 0,
    finalAmountPaise: 14900,
    couponApplied: null as string | null
  });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);

  const achievements = [
    { icon: '🔥', label: '7 Day Streak', unlocked: true },
    { icon: '📚', label: 'First Quiz', unlocked: true },
    { icon: '🎯', label: '100% Accuracy', unlocked: false },
    { icon: '🏆', label: 'Top 10%', unlocked: false },
  ];

  useEffect(() => { loadProfile(); }, []);

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
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    setLanguage(lang);
    try {
      await apiService.auth.updateProfile({ preferredLanguage: lang });
      setProfileData((prev: any) => ({ ...prev, profile: { ...(prev?.profile || {}), preferredLanguage: lang } }));
    } catch (error) {
      console.error('Update preferred language error:', error);
    }
  };

  const xpProgress = ((profileData?.gamification?.totalXP || 0) % 1000) / 10;

  const formatRupees = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  const copyReferralCode = async () => {
    const code = profileData?.referralCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 1500);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const pollSubscriptionActivation = async () => {
    const start = Date.now();
    const timeoutMs = 60000;
    const intervalMs = 3000;

    while (Date.now() - start < timeoutMs) {
      const res = await apiService.billing.getSubscriptionStatus();
      const active = Boolean(res?.data?.data?.isActive);
      if (active) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false;
  };

  const applyCoupon = async () => {
    setUpgradeError('');
    setUpgradeMessage('');
    if (!couponCode.trim()) {
      setPricing({
        baseAmountPaise: 14900,
        discountAmountPaise: 0,
        finalAmountPaise: 14900,
        couponApplied: null
      });
      return;
    }

    setCouponLoading(true);
    try {
      const response = await apiService.billing.validateCoupon({
        code: couponCode.trim().toUpperCase(),
        planCode: 'PRO_MONTHLY'
      });

      if (response.data?.success) {
        setPricing(response.data.pricing);
        setUpgradeMessage(`Coupon applied: ${response.data.pricing?.couponApplied}`);
      }
    } catch (error: any) {
      setUpgradeError(error?.response?.data?.message || 'Invalid coupon');
      setPricing({
        baseAmountPaise: 14900,
        discountAmountPaise: 0,
        finalAmountPaise: 14900,
        couponApplied: null
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const startPremiumCheckout = async () => {
    setUpgradeError('');
    setUpgradeMessage('');
    setUpgradeLoading(true);

    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const initResponse = await apiService.billing.initiateCheckout({
        planCode: 'PRO_MONTHLY',
        couponCode: couponCode.trim() || undefined,
        referralCode: referralCode.trim() || undefined
      });

      const checkout = initResponse?.data?.checkout;
      const serverPricing = initResponse?.data?.pricing;
      if (!checkout?.orderId) {
        throw new Error('Failed to initialize checkout');
      }

      if (serverPricing) {
        setPricing(serverPricing);
      }

      const options = {
        key: checkout.keyId,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        name: 'NEETForge',
        description: 'Pro Monthly Subscription',
        order_id: checkout.orderId,
        prefill: {
          name: profileData?.name || user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#1D4ED8' },
        handler: async (response: any) => {
          try {
            await apiService.billing.verifyCheckout(response);
            setUpgradeMessage('Payment received. Activating premium...');
            const activated = await pollSubscriptionActivation();
            if (activated) {
              await loadProfile();
              setShowUpgradeModal(false);
              setCouponCode('');
              setReferralCode('');
              setUpgradeMessage('');
            } else {
              setUpgradeMessage('Payment is processing. Premium will reflect shortly.');
            }
          } catch (err: any) {
            setUpgradeError(err?.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setUpgradeMessage('');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setUpgradeError(error?.response?.data?.message || error?.message || 'Checkout failed');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-accent transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-bold text-foreground">Profile</h1>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              editing
                ? 'text-primary-foreground shadow-sm'
                : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'
            }`}
            style={editing ? { background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' } : undefined}
          >
            {editing ? (
              <>{loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</>
            ) : (
              <><Edit2 className="w-4 h-4" /> Edit</>
            )}
          </button>
        </div>
      </motion.div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 text-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-primary/20" style={{ background: 'var(--gradient-primary)' }}>
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center border-2 border-card">
              <Shield className="w-3 h-3 text-success-foreground" />
            </div>
          </div>

          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-xl font-bold text-center w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-1"
            />
          ) : (
            <h2 className="text-xl font-bold text-foreground mb-0.5">{profileData?.name || 'NEET Aspirant'}</h2>
          )}
          <p className="text-sm text-muted-foreground">{user?.email}</p>

          {/* Plan badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-semibold text-primary capitalize">{profileData?.subscription?.plan || 'Free'} Plan</span>
          </div>
          {profileData?.subscription?.currentPeriodEnd && (
            <p className="mt-2 text-xs text-muted-foreground">
              Valid till {new Date(profileData.subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-warning" />
              </div>
              <span className="font-bold text-foreground">{profileData?.gamification?.totalXP || 0} XP</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Level {profileData?.gamification?.level || 1}</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">{Math.round(xpProgress * 10)} / 1000 XP to next level</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: Flame, label: t('dashboard.streak'), value: profileData?.gamification?.currentStreak || 0, unit: 'days', color: 'warning' },
            { icon: BookOpen, label: 'Mocks', value: profileData?.analytics?.totalMocksAttempted || 0, unit: '', color: 'primary' },
            { icon: Target, label: t('profile.accuracy'), value: `${profileData?.analytics?.overallAccuracy || 0}%`, unit: '', color: 'success' },
            { icon: Award, label: 'Coins', value: profileData?.gamification?.coins || 0, unit: '', color: 'secondary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-black text-foreground leading-tight">{stat.value}{stat.unit && <span className="text-xs font-medium text-muted-foreground ml-0.5">{stat.unit}</span>}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Academic Info / Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="font-bold text-foreground mb-3 text-sm">{editing ? 'Edit Academic Info' : 'Academic Info'}</h3>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Target Year</label>
                <div className="grid grid-cols-3 gap-2">
                  {['2027', '2026', 'Dropper'].map((year) => (
                    <button key={year} onClick={() => setFormData({ ...formData, targetYear: year })}
                      className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                        formData.targetYear === year ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-foreground'
                      }`}>{year}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Study Hours/Day</label>
                <div className="grid grid-cols-3 gap-2">
                  {['2-3', '4-6', '6+'].map((hours) => (
                    <button key={hours} onClick={() => setFormData({ ...formData, studyHours: hours })}
                      className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                        formData.studyHours === hours ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-foreground'
                      }`}>{hours}hr</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Board %</label>
                <div className="grid grid-cols-2 gap-2">
                  {['<60%', '60-75%', '75-90%', '90+%'].map((range) => (
                    <button key={range} onClick={() => setFormData({ ...formData, boardPercentage: range })}
                      className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                        formData.boardPercentage === range ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-muted border-border text-foreground'
                      }`}>{range}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Mock Score</label>
                <input type="text" value={formData.mockScore} onChange={(e) => setFormData({ ...formData, mockScore: e.target.value })}
                  placeholder="e.g. 450/720"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Weak Subjects</label>
                <div className="flex gap-2">
                  {['Physics', 'Chemistry', 'Biology'].map((subject) => (
                    <button key={subject}
                      onClick={() => setFormData({ ...formData, weakSubjects: toggleArrayItem(formData.weakSubjects, subject) })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        formData.weakSubjects.includes(subject) ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-muted border-border text-foreground'
                      }`}>
                      {formData.weakSubjects.includes(subject) && '✓ '}{subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Target Year', value: profileData?.profile?.targetYear || 'Not set' },
                { label: 'Study Hours', value: `${profileData?.profile?.studyHoursPerDay || 6}hr/day` },
                { label: 'Board %', value: profileData?.profile?.boardPercentage || 'Not set' },
                { label: 'Mock Score', value: profileData?.profile?.mockScore || 'Not attempted' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
              {profileData?.profile?.weakSubjects?.length > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-muted-foreground">Weak Subjects</span>
                  <div className="flex gap-1">
                    {profileData.profile.weakSubjects.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-4"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="font-bold text-foreground mb-3 text-sm">Achievements</h3>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                className={`text-center py-3 rounded-xl border ${a.unlocked ? 'bg-warning/5 border-warning/20' : 'bg-muted/30 border-border opacity-50'}`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-[10px] text-foreground font-medium leading-tight">{a.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        {profileData?.subscription?.plan === 'free' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-4 border-2 border-primary/20" style={{ background: 'var(--gradient-glass)', boxShadow: 'var(--shadow-glow-primary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Go Pro</h3>
                <p className="text-xs text-muted-foreground">Unlimited revisions & features</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUpgradeError('');
                setUpgradeMessage('');
                setShowUpgradeModal(true);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-primary-foreground"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Crown className="w-4 h-4 inline mr-1.5" /> Upgrade - Rs 149/mo
            </button>
          </motion.div>
        )}

        {/* Referral Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
          className="bg-card border border-border rounded-2xl p-4"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-foreground text-sm">Referral Code</h3>
            <span className="text-[11px] text-muted-foreground">Invite friends, earn premium days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm font-mono font-semibold text-foreground">
              {profileData?.referralCode || 'Loading...'}
            </div>
            <button
              onClick={copyReferralCode}
              disabled={!profileData?.referralCode}
              className="px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedReferral ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 rounded-xl bg-muted/40 border border-border px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
            Share this code with friends. They can enter it while upgrading to Pro.
            You get referral premium reward after their first successful paid activation.
          </div>
        </motion.div>

        {/* Language Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-secondary" />
              </div>
              <span className="font-semibold text-foreground text-sm">{t('profile.language')}</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              {(['en', 'hi'] as const).map(lang => (
                <button key={lang} onClick={() => handleLanguageChange(lang)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === lang ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {lang === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button onClick={logout}
            className="w-full bg-card border border-border rounded-2xl p-3.5 flex items-center justify-center gap-2 text-destructive font-semibold text-sm hover:border-destructive/40 transition-colors"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Upgrade to Pro</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon"
                  className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Referral Code (Optional)</label>
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral"
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Use a friend&apos;s code before payment. Referral is locked to your account once applied.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base price</span>
                <span className="text-foreground font-semibold">{formatRupees(pricing.baseAmountPaise)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-success font-semibold">- {formatRupees(pricing.discountAmountPaise)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-foreground">Payable</span>
                <span className="text-foreground">{formatRupees(pricing.finalAmountPaise)}</span>
              </div>
            </div>

            {upgradeError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {upgradeError}
              </div>
            )}
            {upgradeMessage && (
              <div className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
                {upgradeMessage}
              </div>
            )}

            <button
              onClick={startPremiumCheckout}
              disabled={upgradeLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {upgradeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Pay {formatRupees(pricing.finalAmountPaise)}
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;

