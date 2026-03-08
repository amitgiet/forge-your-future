import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Upload, FileText, Wand2, Target, BookMarked, Star, BookOpen } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statColorMap: Record<string, string> = {
  primary: 'nf-stat-icon-primary',
  secondary: 'nf-stat-icon-secondary',
  warning: 'nf-stat-icon-warning',
  success: 'nf-stat-icon-success',
};

interface QuickActionGridProps {
  dueCount: number;
  l2Count: number;
}

const QuickActionGrid = ({ dueCount, l2Count }: QuickActionGridProps) => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Brain, label: 'Revise', sub: dueCount > 0 ? `${dueCount} due` : 'Spaced', path: '/revision', color: 'success' },
    { icon: Sparkles, label: 'Learn', sub: 'AI Path', path: '/my-learning-paths', color: 'warning' },
    { icon: Upload, label: 'Mock', sub: 'Analyze', path: '/mock-analyzer', color: 'secondary' },
    { icon: BookOpen, label: 'NCERT', sub: 'Search', path: '/ncert-search', color: 'primary' },
    { icon: FileText, label: 'Tests', sub: 'Series', path: '/tests', color: 'warning' },
    { icon: Wand2, label: 'AI Quiz', sub: 'Generate', path: '/quiz-generator', color: 'primary' },
    { icon: Target, label: 'Analytics', sub: 'Stats', path: '/analytics', color: 'secondary' },
    { icon: BookMarked, label: 'Formulas', sub: 'Cards', path: '/formula-cards', color: 'primary' },
    { icon: Star, label: 'Doubts', sub: 'Forum', path: '/doubts', color: 'success' },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      <div className="grid grid-cols-3 gap-2.5">
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            variants={fadeUp}
            onClick={() => navigate(action.path)}
            className="glass-card-sm flex flex-col items-center justify-center py-3.5 group cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <div className={`nf-stat-icon ${statColorMap[action.color]} mb-1.5 w-9 h-9 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-[18px] h-[18px]" />
            </div>
            <span className="font-semibold text-foreground text-[13px] leading-tight">{action.label}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{action.sub}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActionGrid;
