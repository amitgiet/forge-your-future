import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const TestStart = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState(false);

  useEffect(() => {
    const loadTestDetails = async () => {
      if (!testId) {
        navigate('/tests');
        return;
      }
      try {
        const res = await apiService.tests.getTestById(testId);
        setTest(res.data.data);
      } catch (error) {
        console.error('Failed to load test details:', error);
        alert('Could not load test details. Please try again.');
        navigate('/tests');
      } finally {
        setLoading(false);
      }
    };
    loadTestDetails();
  }, [testId, navigate]);

  const handleBeginTest = async () => {
    if (!testId) return;
    setStartingTest(true);
    try {
      const res = await apiService.tests.startTest(testId);
      const attemptId = res.data.data.attemptId;
      navigate(`/test/session/${attemptId}`);
    } catch (error: any) {
      console.error('Failed to start test:', error);
      alert(error.response?.data?.message || 'Failed to start the test session.');
      setStartingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test) {
    return null; // Or a more specific error component
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="nf-safe-area p-4 max-w-lg mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate('/tests')}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Test Instructions</h1>
            <p className="text-sm text-muted-foreground">{test.title}</p>
          </div>
        </motion.div>
        
        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nf-card p-6 mb-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-bold text-foreground">{test.config.duration} mins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="font-bold text-foreground">{test.config.totalQuestions}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instructions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Please read the following instructions carefully:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">The timer will start as soon as you click the "Begin Test" button.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">For each correct answer, you will be awarded <span className="font-semibold text-foreground">4 marks</span>.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">For each incorrect answer, <span className="font-semibold text-foreground">1 mark</span> will be deducted.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">There is no negative marking for unattempted questions.</p>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">Do not close the window or refresh the page during the test.</p>
            </li>
          </ul>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <button
            onClick={handleBeginTest}
            disabled={startingTest}
            className="w-full py-4 nf-gradient rounded-xl text-white font-bold text-base shadow-card disabled:opacity-70"
          >
            {startingTest ? 'Starting...' : 'Begin Test'}
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default TestStart;
