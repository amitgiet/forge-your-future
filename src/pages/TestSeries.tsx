import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Target, BookOpen, Zap, Award, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const TEST_TYPES = [
  { value: 'full-length-mock', label: 'Full-Length NEET Mock', icon: '🎯', color: 'purple', desc: '200 questions, 180 minutes' },
  { value: 'full-length-cbt', label: 'Full-Length CBT', icon: '💻', color: 'blue', desc: 'Computer-based simulation' },
  { value: 'custom-part', label: 'Custom Part Test', icon: '⚙️', color: 'green', desc: 'Pick your chapters' },
  { value: 'ncert-focus', label: 'NCERT Focus Test', icon: '📚', color: 'orange', desc: 'NCERT-only questions' },
  { value: 'chapter-wise', label: 'Chapter-Wise Test', icon: '📖', color: 'pink', desc: 'Single chapter practice' },
  { value: 'subject-specific', label: 'Subject-Specific', icon: '🔬', color: 'cyan', desc: 'Physics/Chemistry/Biology' }
];

export default function TestSeries() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredTests(tests);
    } else {
      setFilteredTests(tests.filter(t => t.type === selectedType));
    }
  }, [selectedType, tests]);

  const loadTests = async () => {
    try {
      const res = await apiService.tests.getTests();
      setTests(res.data.data);
      setFilteredTests(res.data.data);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      const res = await apiService.tests.startTest(testId);
      const attemptId = res.data.data.attemptId;
      navigate(`/test/session/${attemptId}`);
    } catch (error: any) {
      console.error('Failed to start test:', error);
      alert(error.response?.data?.message || 'Failed to start test');
    }
  };

  const handleCreateCustom = () => {
    navigate('/test/custom/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="nf-heading text-2xl nf-gradient-text mb-1">Test Series</h1>
          <p className="text-sm text-muted-foreground">Your exam-day rehearsal starts here</p>
        </motion.div>

        {/* Test Type Filter */}
        <div className="mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by test type..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span>All Tests</span>
                </div>
              </SelectItem>
              {TEST_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Custom Test CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleCreateCustom}
          className="mb-6 bg-purple-600 rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg hover:shadow-purple-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Create Custom Test</h3>
                <p className="text-xs text-white/80">Tailor your own practice session</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tests available for this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTests.map((test, index) => {
              const typeInfo = TEST_TYPES.find(t => t.value === test.type);
              return (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="nf-card" // Removed cursor-pointer and hover scaling
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{typeInfo?.icon}</div>
                    {test.isPremium && (
                      <span className="nf-badge nf-badge-warning text-[10px]">PRO</span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-black text-foreground mb-1">{test.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{typeInfo?.desc}</p>
                  
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {test.config.duration}m
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {test.config.totalQuestions}Q
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {test.totalAttempts} attempts
                    </div>
                  </div>
                  
                  <hr className="my-3 border-border/50" />
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTest(test._id);
                    }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg cursor-pointer transition-all"
                  >
                    Start Test
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
