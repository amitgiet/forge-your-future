import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookMarked, Lightbulb, Crown, ChevronRight } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const resources = [
  { icon: BookOpen, title: 'Question Bank', description: 'Bio · Chem · Physics', color: 'success', path: '/curriculum-browser' },
  { icon: BookMarked, title: 'PYQ Notes', description: 'Marked NCERT', color: 'primary', path: '/pyq-marked-ncert' },
  { icon: Lightbulb, title: 'Important Topics', description: 'Essentials', color: 'warning', path: '#' },
  { icon: Crown, title: "Toppers' Guide", description: 'Expert tips', color: 'success', path: '#' },
];

const StudyResourcesList = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-2">
      {resources.map((r, i) => (
        <motion.button
          key={i}
          variants={fadeUp}
          onClick={() => r.path !== '#' && navigate(r.path)}
          disabled={r.path === '#'}
          className={`w-full p-3.5 rounded-xl flex items-center gap-3 bg-card border border-border transition-all ${
            r.path === '#' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-card active:scale-[0.98]'
          }`}
          whileTap={r.path !== '#' ? { scale: 0.98 } : undefined}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            r.color === 'primary' ? 'bg-primary/10 text-primary'
              : r.color === 'warning' ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          }`}>
            <r.icon className="w-[18px] h-[18px]" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{r.title}</p>
            <p className="text-[10px] text-muted-foreground">{r.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.button>
      ))}
    </motion.div>
  );
};

export default StudyResourcesList;
