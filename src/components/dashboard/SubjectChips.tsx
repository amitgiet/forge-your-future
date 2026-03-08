import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, Dna } from 'lucide-react';

const subjects = [
  { label: 'Physics', icon: BookOpen, path: '/curriculum-browser?subject=physics', color: 'primary' },
  { label: 'Chemistry', icon: FlaskConical, path: '/curriculum-browser?subject=chemistry', color: 'warning' },
  { label: 'Biology', icon: Dna, path: '/curriculum-browser?subject=biology', color: 'success' },
];

const SubjectChips = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {subjects.map((s) => (
        <motion.button
          key={s.label}
          onClick={() => navigate(s.path)}
          className="flex-1 glass-card-sm flex items-center justify-center gap-2 py-3 group cursor-pointer"
          whileTap={{ scale: 0.96 }}
        >
          <s.icon className={`w-4 h-4 ${
            s.color === 'primary' ? 'text-primary' : s.color === 'warning' ? 'text-warning' : 'text-success'
          }`} />
          <span className="text-sm font-semibold text-foreground">{s.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default SubjectChips;
