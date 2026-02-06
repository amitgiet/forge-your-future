import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Zap, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import TrackChapter from './TrackChapter';

const NeuronzDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);
  const [showTrackModal, setShowTrackModal] = useState(false);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const levelInfo = [
    { level: 1, interval: '24h', color: 'bg-red-500' },
    { level: 2, interval: '3d', color: 'bg-orange-500' },
    { level: 3, interval: '5d', color: 'bg-yellow-500' },
    { level: 4, interval: '7d', color: 'bg-green-500' },
    { level: 5, interval: '10d', color: 'bg-blue-500' },
    { level: 6, interval: '15d', color: 'bg-purple-500' },
    { level: 7, interval: '30d', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <TrackChapter isOpen={showTrackModal} onClose={() => setShowTrackModal(false)} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">NeuronZ</h2>
            <p className="text-sm text-muted-foreground">NCERT Line Revision</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrackModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Track Chapter
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!dueLines || dueLines.total === 0}
            onClick={() => {
              if (dueLines && dueLines.lines && dueLines.lines.length > 0) {
                const firstDueLine = dueLines.lines[0];
                navigate(`/revision?revisionId=${firstDueLine._id}`);
              }
            }}
            className="gap-2"
          >
            Start Revision
          </Button>
        </div>
      </motion.div>

      {/* Due Today Summary */}
      {dueLines && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Due Today: {dueLines.total} lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {levelInfo.map(({ level, interval, color }) => {
                  const count = dueLines.byLevel[`L${level}` as keyof typeof dueLines.byLevel]?.length || 0;
                  return (
                    <div
                      key={level}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="font-medium">L{level}</span>
                        <span className="text-xs text-muted-foreground">({interval})</span>
                      </div>
                      <Badge variant={count > 0 ? "default" : "secondary"}>
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mastery Progress */}
      {masteryProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Mastery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Mastery</span>
                    <span className="font-medium">{masteryProgress.masteryPercentage}%</span>
                  </div>
                  <Progress value={masteryProgress.masteryPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{masteryProgress.totalLines}</p>
                    <p className="text-xs text-muted-foreground">Total Lines</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{masteryProgress.masteredLines}</p>
                    <p className="text-xs text-muted-foreground">Mastered (L7)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{masteryProgress.averageLevel.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Avg Level</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Level Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">NeuronZ Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {levelInfo.map(({ level, interval, color }) => (
                <div key={level} className="flex items-center gap-3 text-sm">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="font-medium min-w-[2rem]">L{level}:</span>
                  <span className="text-muted-foreground">+{interval}</span>
                  {level === 7 && (
                    <Badge variant="secondary" className="ml-auto">
                      Mastered
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <p className="font-medium mb-1">How it works:</p>
              <p>✅ Correct answer → Advance 1 level</p>
              <p>❌ Incorrect answer → Stay same level or drop 1</p>
              <p>🎯 L7 = Mastered (30 days locked)</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NeuronzDashboard;