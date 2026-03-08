import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Target } from 'lucide-react';

interface TodayStatsBarProps {
  studyTime: string;
  questions: number;
  accuracy: number;
}

const TodayStatsBar = ({ studyTime, questions, accuracy }: TodayStatsBarProps) => {
  const stats = [
    { icon: Clock, value: studyTime, label: 'Study', color: 'text-primary' },
    { icon: CheckCircle2, value: String(questions), label: 'Questions', color: 'text-success' },
    { icon: Target, value: `${accuracy}%`, label: 'Accuracy', color: 'text-warning' },
  ];

  return (
    <motion.div
      className="glass-card-sm flex items-center justify-around py-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <s.icon className={`w-4 h-4 ${s.color}`} />
          <div>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default TodayStatsBar;
