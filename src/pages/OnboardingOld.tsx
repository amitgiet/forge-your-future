import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Brain, BookOpen, ChevronRight, Crown, Sparkles, Zap } from 'lucide-react';

const steps = [
  {
    key: 'step1',
    icon: Shield,
    color: 'primary',
    emoji: '🛡️',
  },
  {
    key: 'step2',
    icon: Brain,
    color: 'secondary',
    emoji: '🧠',
  },
  {
    key: 'step3',
    icon: BookOpen,
    color: 'accent',
    emoji: '📚',
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStart = (isPro: boolean) => {
    navigate('/app/dashboard');
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          text: 'text-primary',
          gradient: 'from-primary to-warning',
        };
      case 'secondary':
        return {
          bg: 'bg-secondary/10',
          border: 'border-secondary/30',
          text: 'text-secondary',
          gradient: 'from-secondary to-accent',
        };
      case 'accent':
        return {
          bg: 'bg-accent/10',
          border: 'border-accent/30',
          text: 'text-accent',
          gradient: 'from-accent to-success',
        };
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          text: 'text-primary',
          gradient: 'from-primary to-warning',
        };
    }
  };

  const colors = getColorClasses(step.color);

  return (
    <div className="min-h-screen flex flex-col bg-background nf-safe-area p-6">
      {/* Progress dots */}
      <div className="flex justify-center gap-3 mb-8">
        {steps.map((s, index) => (
          <motion.div
            key={index}
            className={`h-3 rounded-full transition-all duration-300 border-2 ${
              index === currentStep 
                ? `w-10 ${getColorClasses(s.color).bg} ${getColorClasses(s.color).border}` 
                : index < currentStep
                ? 'w-3 bg-success border-success'
                : 'w-3 bg-muted border-border'
            }`}
            animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Emoji */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              {step.emoji}
            </motion.div>

            {/* Icon */}
            <motion.div
              className={`w-32 h-32 mx-auto mb-8 rounded-3xl ${colors.bg} border-4 ${colors.border} flex items-center justify-center shadow-elevated`}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Icon className={`w-16 h-16 ${colors.text}`} />
            </motion.div>

            {/* Text */}
            <h2 className="nf-heading text-2xl text-foreground mb-4">
              {t(`onboarding.${step.key}.title`)}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t(`onboarding.${step.key}.desc`)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-8">
        {currentStep < steps.length - 1 ? (
          <motion.button
            onClick={handleNext}
            className="nf-btn-primary"
            whileTap={{ scale: 0.98 }}
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={() => handleStart(false)}
              className="nf-btn-outline"
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Zap className="w-5 h-5" />
              {t('onboarding.startFree')}
            </motion.button>
            <motion.button
              onClick={() => handleStart(true)}
              className="nf-btn-secondary"
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Crown className="w-5 h-5" />
              {t('onboarding.proPlan')}
              <Sparkles className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>

      {/* Skip option */}
      {currentStep < steps.length - 1 && (
        <motion.button
          onClick={() => setCurrentStep(steps.length - 1)}
          className="mt-4 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Skip intro
        </motion.button>
      )}
    </div>
  );
};

export default Onboarding;

