import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
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
  const l2 = dueQuestions?.byLevel?.L2?.length || 0;
  const l3 = dueQuestions?.byLevel?.L3?.length || 0;

  if (!dueQuestions || total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 nf-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="nf-heading text-foreground">NeuronZ Due Today</h3>
        </div>
        <button
          onClick={() => navigate('/revision')}
          className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
        >
          Open
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Due</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-warning">{l2}</div>
          <div className="text-xs text-muted-foreground">L2</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{l3}</div>
          <div className="text-xs text-muted-foreground">L3</div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/revision')}
        className="nf-btn-primary w-full"
      >
        Start Revision ({total})
      </motion.button>
    </motion.div>
  );
}
