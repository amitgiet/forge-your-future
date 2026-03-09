import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Circle,
    Clock,
    Play,
    ArrowLeft,
    CalendarDays,
    Target,
    Sparkles,
    BookOpen,
    Zap
} from 'lucide-react';
import apiService from '../lib/apiService';
import { useLanguage } from '../contexts/LanguageContext';

interface StudyTask {
    _id: string;
    chapterId: string;
    subject: string;
    taskType: string;
    title: string;
    duration: number;
    timeSlot: string;
    isCompleted: boolean;
}

interface DailyPlan {
    date: string;
    dailyGoal: {
        studyHours: number;
        completedHours: number;
        percentage: number;
    };
    tasks: StudyTask[];
}

interface StudyPlanData {
    title: string;
    examType: string;
    targetDate: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: {
        totalChapters: number;
        completedChapters: number;
        totalHours: number;
        completedHours: number;
        overallProgress: number;
    };
    dailyTasks: DailyPlan[];
    recommendations: Array<{
        type: string;
        message: string;
        priority: string;
    }>;
}

const StudyPlanner = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<StudyPlanData | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            const res = await apiService.studyPlan.getStudyPlan();
            if (res.data?.success && res.data?.data) {
                setPlan(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch plan', error);
        } finally {
            setLoading(false);
        }
    };

    const generateNewPlan = async () => {
        try {
            setGenerating(true);
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + 4); // 4 months from now

            const res = await apiService.studyPlan.generateStudyPlan({ targetDate: targetDate.toISOString() });
            if (res.data?.success && res.data?.data) {
                setPlan(res.data.data);
                // Ensure today is selected
                setSelectedDate(new Date());
            }
        } catch (error) {
            console.error('Failed to generate plan', error);
        } finally {
            setGenerating(false);
        }
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
        if (!plan) return;

        // Optimistic update
        const updatedPlan = { ...plan };
        let taskFound = false;
        updatedPlan.dailyTasks.forEach(dt => {
            dt.tasks.forEach(t => {
                if (t._id === taskId) {
                    t.isCompleted = !currentStatus;
                    taskFound = true;
                }
            });
        });

        if (taskFound) {
            setPlan(updatedPlan);
            try {
                await apiService.studyPlan.updateTaskStatus(taskId, !currentStatus);
            } catch (error) {
                console.error('Failed to update task', error);
                // Revert on error
                fetchPlan();
            }
        }
    };

    const getDayPlan = (date: Date) => {
        if (!plan || !plan.dailyTasks) return null;
        return plan.dailyTasks.find(dt => {
            const dtDate = new Date(dt.date);
            return dtDate.getDate() === date.getDate() &&
                dtDate.getMonth() === date.getMonth() &&
                dtDate.getFullYear() === date.getFullYear();
        });
    };

    // Generate an array of dates starting from today for a 7-day scrollable selector
    const generateWeekDays = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start from yesterday
        const start = new Date(today);
        start.setDate(today.getDate() - 1);

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = generateWeekDays();
    const selectedDayPlan = getDayPlan(selectedDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-28 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="glow-orb glow-orb-primary w-[300px] h-[300px] top-1/4 left-1/4 animate-glow-pulse" />
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin relative z-10" />
                <p className="mt-4 text-muted-foreground font-medium uppercase tracking-widest text-sm relative z-10">Loading Plan...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen pb-28 relative overflow-hidden">
                <div className="glow-orb glow-orb-secondary w-[400px] h-[400px] -top-32 -right-32 animate-glow-pulse" />

                <div className="nf-safe-area p-5 relative z-10">
                    <button onClick={() => navigate(-1)} className="mb-6 w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-foreground hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                            <CalendarDays className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="nf-heading text-3xl mb-3">No Study Plan</h1>
                        <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">You haven't generated a personalized schedule yet. Let AI build a plan tailored to your NEET goals.</p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateNewPlan}
                            disabled={generating}
                            className="px-8 py-4 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                            style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate AI Plan
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate some stats from selectedDayPlan safely
    const completedTasks = selectedDayPlan?.tasks.filter(t => t.isCompleted).length || 0;
    const totalTasks = selectedDayPlan?.tasks.length || 0;
    const dayProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Calculate Backlog (overdue tasks from previous days in the plan)
    const overdueTasksCount = plan.dailyTasks.reduce((acc, dt) => {
        const dtDate = new Date(dt.date);
        dtDate.setHours(0, 0, 0, 0);
        if (dtDate < today) {
            return acc + dt.tasks.filter(t => !t.isCompleted).length;
        }
        return acc;
    }, 0);

    return (
        <div className="min-h-screen pb-28 relative overflow-hidden">
            {/* Background glow orbs */}
            <div className="glow-orb glow-orb-primary w-[300px] h-[300px] -top-32 -right-32 animate-glow-pulse" />
            <div className="glow-orb glow-orb-secondary w-[250px] h-[250px] top-1/3 -left-20 animate-glow-pulse" style={{ animationDelay: '2s' }} />

            <div className="nf-safe-area p-5 relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-foreground hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="nf-heading text-2xl tracking-tighter">Study Planner</h1>
                    </div>
                    <div className="glass-card-sm px-3 py-1.5 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">{plan.examType}</span>
                    </div>
                </div>

                {/* Global Progress Card */}
                <motion.div
                    className="glass-card mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Overall Progress</p>
                            <h2 className="text-3xl font-extrabold">{plan.progress?.overallProgress || 0}%</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Chapters</p>
                            <p className="text-sm font-bold text-foreground">{plan.progress?.completedChapters || 0} <span className="text-muted-foreground font-normal">/ 97</span></p>
                        </div>
                    </div>

                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                        <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress?.overallProgress || 0}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                    </div>
                </motion.div>

                {/* Backlog Warning */}
                {overdueTasksCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 glass-card bg-destructive/10 border-destructive/30 py-3 flex gap-3 items-center"
                    >
                        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 ml-1 border border-destructive/30">
                            <span className="font-extrabold text-destructive text-sm">{overdueTasksCount}</span>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">Tasks Overdue</h4>
                            <p className="text-xs text-muted-foreground leading-snug">You have uncompleted tasks from previous days. Catch up on Sunday!</p>
                        </div>
                    </motion.div>
                )}

                {/* AI Recommendations */}
                {plan.recommendations && plan.recommendations.length > 0 && (
                    <div className="mb-6 space-y-3">
                        {plan.recommendations.map((rec, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="glass-card bg-primary/10 border-primary/20 py-3 flex gap-3 items-start"
                            >
                                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{rec.type.replace('_', ' ')}</h4>
                                    <p className="text-sm text-foreground/90 leading-relaxed">{rec.message}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Week Calendar Strip */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="nf-heading text-sm uppercase tracking-wider">Schedule</h3>
                        <span className="text-xs text-muted-foreground font-medium uppercase">{selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 snap-x hide-scrollbar">
                        {weekDays.map((d, i) => {
                            const isSelected = d.toDateString() === selectedDate.toDateString();
                            const isToday = d.toDateString() === today.toDateString();
                            const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });

                            // Check if day has completed all tasks
                            const dPlan = getDayPlan(d);
                            const allDone = dPlan && dPlan.tasks.length > 0 && dPlan.tasks.every(t => t.isCompleted);
                            const hasTasks = dPlan && dPlan.tasks.length > 0;

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(d)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[64px] snap-center transition-all ${isSelected
                                        ? 'bg-white text-black nf-shadow-glow'
                                        : 'glass-card border-white/5 hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-black/60' : 'text-muted-foreground'}`}>{dayStr}</span>
                                    <span className={`text-xl font-extrabold ${isSelected ? 'text-black' : isToday ? 'text-primary' : 'text-foreground'}`}>
                                        {d.getDate()}
                                    </span>
                                    <div className="flex gap-1 mt-2">
                                        {hasTasks && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${allDone ? 'bg-success' : 'bg-warning'}`} />
                                        )}
                                        {!hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-transparent" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Tasks */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="nf-heading text-sm uppercase tracking-wider">
                            {selectedDate.toDateString() === today.toDateString() ? "Today's Tasks" : selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) + "'s Tasks"}
                        </h3>
                        {totalTasks > 0 && (
                            <span className="text-xs font-bold text-muted-foreground">{completedTasks}/{totalTasks} Done</span>
                        )}
                    </div>

                    {!selectedDayPlan || selectedDayPlan.tasks.length === 0 ? (
                        <div className="glass-card py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-bold mb-1">Rest Day!</p>
                            <p className="text-xs text-muted-foreground">No tasks scheduled for this day.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayPlan.tasks.map((task, idx) => (
                                <motion.div
                                    key={task._id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                    className={`relative glass-card border p-5 transition-all duration-300 ${task.isCompleted ? 'bg-success/5 border-success/20 opacity-70' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                                >
                                    {/* Focus Mode indicator (glow behind pending task) */}
                                    {!task.isCompleted && idx === 0 && (
                                        <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 rounded-2xl animate-pulse" />
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => toggleTaskStatus(task._id, task.isCompleted)}
                                            className="mt-1 flex-shrink-0 relative group"
                                        >
                                            {task.isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 text-success" />
                                            ) : (
                                                <>
                                                    <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <div className="absolute inset-0 bg-primary/20 scale-150 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </>
                                            )}
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1
                                                      ${task.subject.toLowerCase() === 'physics' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                            task.subject.toLowerCase() === 'chemistry' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                                task.subject.toLowerCase() === 'biology' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'}
                                                    `}>
                                                        {task.taskType === 'STUDY' ? <BookOpen className="w-3 h-3" /> :
                                                            task.taskType === 'REVISION' ? <Target className="w-3 h-3" /> :
                                                                <CalendarIcon className="w-3 h-3" />}
                                                        {task.subject}
                                                    </span>

                                                    {/* Subject/Type tag */}
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 py-0.5 px-2 rounded border border-white/5">
                                                        {task.taskType}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium bg-black/50 px-2 py-1 rounded-full border border-white/5">
                                                    <Clock className="w-3 h-3" />
                                                    {task.duration}m
                                                </div>
                                            </div>

                                            <h4 className={`text-base font-bold leading-snug mb-3 ${task.isCompleted ? 'text-muted-foreground line-through decoration-white/30' : 'text-foreground'}`}>
                                                {task.title}
                                            </h4>

                                            {!task.isCompleted && (
                                                <div className="flex items-center gap-3 mt-4">
                                                    <button
                                                        onClick={() => navigate(task.taskType === 'MOCK' ? `/quiz-session` : `/curriculum-browser`)}
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
                                                    >
                                                        <Play className="w-3 h-3" fill="currentColor" /> {task.taskType === 'MOCK' ? 'Start Test' : 'Open Curriculum'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudyPlanner;
