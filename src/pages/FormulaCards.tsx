import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FlaskConical, Atom, Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// Demo data
const DEMO_DATA = {
  title: "Formula Cards",
  subjects: [
    {
      _id: "s1",
      title: "Physics",
      icon: "physics",
      cardsCount: 857,
      chapters: [
        { _id: "c1", title: "Semiconductors", color: "#16A249", cardsCount: 51, topicsCount: 1 },
        { _id: "c2", title: "Current Electricity", color: "#2F86FF", cardsCount: 39, topicsCount: 9 },
        { _id: "c3", title: "Alternating Current", color: "#FC275A", cardsCount: 11, topicsCount: 2 },
        { _id: "c4", title: "Rotational Motion", color: "#B248CC", cardsCount: 33, topicsCount: 5 },
        { _id: "c5", title: "Oscillations", color: "#2073E5", cardsCount: 33, topicsCount: 5 },
      ],
    },
    {
      _id: "s2",
      title: "Chemistry",
      icon: "chemistry",
      cardsCount: 910,
      chapters: [
        { _id: "c6", title: "Some Basic Concepts of Chemistry", color: "#EB670C", cardsCount: 12, topicsCount: 3 },
        { _id: "c7", title: "General Organic Chemistry", color: "#F76707", cardsCount: 40, topicsCount: 7 },
        { _id: "c8", title: "Structure of Atom", color: "#37B24D", cardsCount: 34, topicsCount: 7 },
        { _id: "c9", title: "Amines", color: "#F76707", cardsCount: 42, topicsCount: 4 },
        { _id: "c10", title: "Hydrocarbons", color: "#37B24D", cardsCount: 74, topicsCount: 10 },
      ],
    },
  ],
};

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Zap className="w-5 h-5" />,
  chemistry: <FlaskConical className="w-5 h-5" />,
  biology: <Atom className="w-5 h-5" />,
};

const FormulaCards: React.FC = () => {
  const navigate = useNavigate();

  const openChapter = (subjectTitle: string, chapter: typeof DEMO_DATA.subjects[0]['chapters'][0]) => {
    navigate(`/formula-cards/${chapter._id}`, {
      state: { subjectTitle, chapterTitle: chapter.title, chapterColor: chapter.color },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">📋 {DEMO_DATA.title}</h1>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {DEMO_DATA.subjects.map((subject) => (
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Subject header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-muted text-foreground">
                  {subjectIcons[subject.icon] || <Atom className="w-5 h-5" />}
                </span>
                <div>
                  <h2 className="font-bold text-foreground">{subject.title}</h2>
                  <p className="text-xs text-muted-foreground">{subject.cardsCount} Formula Cards</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <p className="text-xs text-muted-foreground mb-2">Recent chapters</p>

            {/* Horizontal chapter cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {subject.chapters.slice(0, 3).map((chapter) => (
                <motion.button
                  key={chapter._id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openChapter(subject.title, chapter)}
                  className="flex-shrink-0 w-[130px] h-[140px] rounded-2xl p-3 flex flex-col justify-between text-left relative overflow-hidden"
                  style={{ backgroundColor: chapter.color }}
                >
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-3">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-[11px] text-white/80 font-medium">📄 {chapter.cardsCount}</span>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default FormulaCards;
