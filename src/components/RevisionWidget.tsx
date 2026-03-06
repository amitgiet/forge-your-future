import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';

export default function RevisionWidget() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dueLines, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  if (isLoading) return null;
  if (!dueLines || dueLines.total === 0) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const overdueCount = dueLines.lines.filter((line: any) => {
    if (!line?.nextRevision) return false;
    const nextRevisionDate = new Date(line.nextRevision);
    return !Number.isNaN(nextRevisionDate.getTime()) && nextRevisionDate < startOfToday;
  }).length;
  const l2Count = dueLines.byLevel?.L2?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 nf-card relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-primary/[0.06]" />
      <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full bg-destructive/[0.05]" />
      <div className="absolute top-3 right-3 w-10 h-16 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '6px 6px'
        }}
      />
      {/* Thin accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{ background: 'var(--gradient-primary)', opacity: 0.3 }}
      />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="nf-heading text-foreground">7-Level Revision</h3>
        </div>
        <button
          onClick={() => navigate('/revision')}
          className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 relative">
        {[
          { value: dueLines.total, label: 'Due Today', color: 'text-foreground' },
          { value: overdueCount, label: 'Overdue', color: 'text-destructive' },
          { value: l2Count, label: 'L2 Due', color: 'text-warning' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-muted rounded-lg p-3 text-center">
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-10 ${
              i === 0 ? 'bg-primary' : i === 1 ? 'bg-destructive' : 'bg-warning'
            }`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3 relative">
        {dueLines.total} topics due for revision today
      </p>

      <div className="space-y-2 relative">
        {dueLines.lines.slice(0, 3).map((line: any) => (
          <motion.div
            key={line._id}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/revision?revisionId=${line._id}`)}
            className="bg-muted rounded-lg p-3 border border-border hover:border-primary/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-semibold">
                    L{line.level}
                  </span>
                  <span className="font-semibold text-sm text-foreground break-words line-clamp-2">
                    {line.lineId?.ncertText || 'NCERT Line'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>{line.lineId?.subject}</span>
                  <span>•</span>
                  <span>Level {line.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                {Math.round(line.overallAccuracy || 0)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/revision')}
        className="nf-btn-primary w-full mt-4"
      >
        Start Revising ({dueLines.total} topics)
      </motion.button>
    </motion.div>
  );
}
