import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueQuestions } from '@/store/slices/neuronzSlice';

export default function RevisionWidget() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dueQuestions, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueQuestions());
  }, [dispatch]);

  if (isLoading) return null;

  const total = dueQuestions?.total || 0;
  if (!dueQuestions || total === 0) return null;

  const l2 = dueQuestions?.byLevel?.L2?.length || 0;
  const l3 = dueQuestions?.byLevel?.L3?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-card rounded-2xl border border-border p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">NeuronZ Due Today</h3>
            <p className="text-xs text-muted-foreground">{total} questions waiting</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/app/revision')}
          className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-xl font-bold text-foreground">{total}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Due</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-xl font-bold text-foreground">{l2}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">L2</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-xl font-bold text-foreground">{l3}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">L3</div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/app/revision')}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm"
      >
        Start Revision ({total})
      </motion.button>
    </motion.div>
  );
}
