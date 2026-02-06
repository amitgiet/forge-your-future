import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Search, BookOpen, Clock, StickyNote, Bell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const mockResults = [
  {
    id: 1,
    title: 'Mitosis and Meiosis',
    book: 'Biology Class 11',
    chapter: 'Chapter 10: Cell Cycle',
    page: 162,
    line: 'Line 14-18',
    excerpt: '...Mitosis is the type of cell division by which a single cell divides in such a way as to produce two genetically identical "daughter cells"...',
    highlight: 'Mitosis is the type of cell division',
  },
  {
    id: 2,
    title: 'Phases of Mitosis',
    book: 'Biology Class 11',
    chapter: 'Chapter 10: Cell Cycle',
    page: 164,
    line: 'Line 5-12',
    excerpt: '...Prophase, metaphase, anaphase and telophase are the four stages of mitosis. During prophase, the chromatin condenses into discrete chromosomes...',
    highlight: 'Prophase, metaphase, anaphase and telophase',
  },
  {
    id: 3,
    title: 'Cytokinesis',
    book: 'Biology Class 11',
    chapter: 'Chapter 10: Cell Cycle',
    page: 168,
    line: 'Line 22-25',
    excerpt: '...Cytokinesis is the physical process of cell division, which divides the cytoplasm of a parental cell into two daughter cells...',
    highlight: 'Cytokinesis is the physical process',
  },
];

const NCERTSearch = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="bg-warning/30 text-foreground font-bold px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button onClick={() => navigate('/dashboard')} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="nf-heading text-xl text-foreground">{t('ncert.title')}</h1>
            <p className="text-xs text-muted-foreground">Find exact references instantly</p>
          </div>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="nf-card !p-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('ncert.placeholder')}
                className="w-full h-12 pl-10 pr-24 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors font-medium"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-glow-primary"
              >
                Search
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">
                  {mockResults.length} results found
                </p>
                <span className="nf-badge nf-badge-success">
                  <Sparkles className="w-3 h-3" />
                  AI Powered
                </span>
              </div>

              {mockResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="nf-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="nf-heading text-foreground">{result.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {result.book} • {result.chapter}
                      </p>
                    </div>
                    <span className="nf-badge nf-badge-primary">
                      <BookOpen className="w-3 h-3" />
                      p.{result.page}
                    </span>
                  </div>

                  <span className="nf-badge nf-badge-outline text-xs mb-3">
                    {result.line}
                  </span>

                  <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-3 bg-muted/30 py-2 pr-2 rounded-r-lg">
                    {highlightText(result.excerpt, result.highlight)}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="nf-badge nf-badge-primary cursor-pointer hover:opacity-80 transition-opacity">
                      <Clock className="w-3.5 h-3.5" />
                      {t('ncert.spacedQuizzes')}
                    </button>
                    <button className="nf-badge nf-badge-outline cursor-pointer hover:border-primary hover:text-primary transition-all">
                      <StickyNote className="w-3.5 h-3.5" />
                      {t('ncert.notes')}
                    </button>
                    <button className="nf-badge nf-badge-secondary cursor-pointer hover:opacity-80 transition-opacity">
                      <Bell className="w-3.5 h-3.5" />
                      {t('ncert.tomorrow')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-16 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="nf-heading text-lg text-foreground mb-2">Search NCERT</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Find exact line references from your NCERT textbooks instantly
            </p>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['Mitosis', 'Photosynthesis', 'DNA Replication', 'Krebs Cycle'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    setHasSearched(true);
                  }}
                  className="nf-badge nf-badge-outline cursor-pointer hover:border-primary hover:text-primary transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default NCERTSearch;
