import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Star, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Demo topics & cards for "Some Basic Concepts of Chemistry"
const DEMO_TOPICS = [
  {
    _id: 't1',
    title: 'Mole concept',
    cardsCount: 4,
    cards: [
      { _id: 'fc1', title: 'Mole Concept 1', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00379_b3722763add692898188da77.webp' },
      { _id: 'fc2', title: 'Mole Concept 2', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00380_757b4d230dabbc5d28962284.webp' },
      { _id: 'fc3', title: 'Mole Concept 3', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00381_0c95c5fdc811afd4b4f485eb.webp' },
      { _id: 'fc4', title: 'Mole Concept 4', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00382_c7afa1098afea821f7bc80b3.webp' },
    ],
  },
  {
    _id: 't2',
    title: 'Quantitative measures in chemical equations',
    cardsCount: 5,
    cards: [
      { _id: 'fc5', title: 'Vapour Density', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00383_f1aaf518dcdb088121c0433a.webp' },
      { _id: 'fc6', title: 'Molar mass', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00384_4b0e8bb86ae1f6dcd5512eb4.webp' },
      { _id: 'fc7', title: 'Equivalent weight', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00385_4234990e1b3d6eb31d306c0b.webp' },
      { _id: 'fc8', title: 'Normality', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00386_f9154d7c97de9af961420608.webp' },
      { _id: 'fc9', title: 'Molarity', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00379_b3722763add692898188da77.webp' },
    ],
  },
  {
    _id: 't3',
    title: 'Laws of chemical combination',
    cardsCount: 3,
    cards: [
      { _id: 'fc10', title: 'Law of multiple proportion', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00380_757b4d230dabbc5d28962284.webp' },
      { _id: 'fc11', title: 'Law of definite proportions', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00381_0c95c5fdc811afd4b4f485eb.webp' },
      { _id: 'fc12', title: 'Conservation of mass', imgUrl: 'https://cdn-assets.getmarks.app/app_assets/img/ui/formula_cards/cards/physics/semiconductor_00382_c7afa1098afea821f7bc80b3.webp' },
    ],
  },
];

const FILTER_TABS = [
  { key: 'all', label: 'All Formulae', icon: BookOpen, color: 'text-blue-500' },
  { key: 'revision', label: 'Need Revision', icon: Star, color: 'text-yellow-500' },
  { key: 'bookmarks', label: 'Bookmarks', icon: Star, color: 'text-purple-500' },
  { key: 'unseen', label: 'Not Seen', icon: EyeOff, color: 'text-red-500' },
  { key: 'memorized', label: 'Memorized', icon: CheckCircle, color: 'text-green-500' },
];

const FormulaChapterDetail: React.FC = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const location = useLocation();
  const { subjectTitle, chapterTitle, chapterColor } = (location.state || {}) as any;
  const [activeFilter, setActiveFilter] = useState('all');

  const totalCards = DEMO_TOPICS.reduce((sum, t) => sum + t.cardsCount, 0);

  const openCardViewer = (topicTitle: string, cards: typeof DEMO_TOPICS[0]['cards'], startIndex = 0) => {
    navigate('/formula-cards/viewer', {
      state: {
        subjectTitle,
        chapterTitle: chapterTitle || 'Chapter',
        topicTitle,
        cards,
        startIndex,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{chapterTitle || 'Chapter'}</h1>
          <p className="text-xs text-muted-foreground">{totalCards} Formula Cards</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${
              activeFilter === tab.key ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${tab.color}`} />
            <span className="text-[10px] text-muted-foreground leading-tight text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Topics heading */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="font-semibold text-foreground">All Topics</h2>
        <span className="text-xs text-muted-foreground">{DEMO_TOPICS.length} Topics</span>
      </div>

      {/* Topic cards grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {DEMO_TOPICS.map((topic, idx) => (
          <motion.button
            key={topic._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openCardViewer(topic.title, topic.cards)}
            className="rounded-2xl overflow-hidden bg-card border border-border text-left"
          >
            {/* Preview image */}
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={topic.cards[0]?.imgUrl}
                alt={topic.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-2.5">
              <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{topic.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{topic.cardsCount} cards</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FormulaChapterDetail;
