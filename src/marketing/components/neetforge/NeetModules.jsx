import React, { useState, useRef } from "react";
import { ClipboardList, FlaskConical, Cpu, BookMarked, CreditCard, MessageCircle, BarChart2, ArrowRight } from "lucide-react";

const modules = [
  {
    icon: ClipboardList,
    id: "dpp",
    title: "Daily Practice",
    shortTitle: "Daily DPP",
    tag: "Build Habit",
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    gradient: "from-blue-600 to-blue-700",
    progress: 72,
    streak: "12-day streak 🔥",
    desc: "Daily curated practice sets with a timed solving flow. Build consistency through a routine challenge format that keeps you on track every single day.",
    bullets: ["Fresh curated questions daily", "Timed solving mode", "Consistency streaks & rewards", "Progress tracked over weeks"],
  },
  {
    icon: FlaskConical,
    id: "quiz",
    title: "Quiz Engine",
    shortTitle: "Quiz & Test",
    tag: "Practice Mode",
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    gradient: "from-indigo-600 to-indigo-700",
    progress: 55,
    streak: "34 questions today",
    desc: "Chapter/topic-based quizzes and fully custom test creation. Choose subject, chapter, and topic — then practice or compete against the clock.",
    bullets: ["Custom test creation", "NTA-style timed player", "Chapter/topic filtering", "Instant result breakdown"],
  },
  {
    icon: Cpu,
    id: "ai",
    title: "AI Analysis",
    shortTitle: "AI Quiz",
    tag: "AI-Powered",
    color: "bg-violet-600",
    lightColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    gradient: "from-violet-600 to-violet-700",
    progress: 40,
    streak: "3 weak areas found",
    desc: "AI-assisted test generation and deep performance analysis. Know exactly which concepts to drop time on and which to revisit.",
    bullets: ["AI-generated question sets", "Weak area detection", "Concept-level performance mapping", "Improvement prioritization"],
  },
  {
    icon: BookMarked,
    id: "revision",
    title: "Revision",
    shortTitle: "NeuronZ",
    tag: "Neuronz Flow",
    color: "bg-green-600",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    gradient: "from-green-600 to-green-700",
    progress: 28,
    streak: "48 cards due today",
    desc: "Adaptive revision queue driven by your actual attempt history. Resurface mistakes at the right time for long-term retention.",
    bullets: ["Performance-based queue", "Revisit previously wrong Qs", "Spaced repetition logic", "Long-term retention focus"],
  },
  {
    icon: CreditCard,
    id: "formula",
    title: "Formulas",
    shortTitle: "Formula Cards",
    tag: "Rapid Review",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-500",
    borderColor: "border-orange-200",
    gradient: "from-orange-500 to-orange-600",
    progress: 61,
    streak: "120 cards reviewed",
    desc: "Swipe-based formula and concept cards for quick pre-test review. Palette/progress navigation to track your card coverage at a glance.",
    bullets: ["Swipe-based UX", "All subjects covered", "Progress palette view", "Pre-test rapid refresh"],
  },
  {
    icon: MessageCircle,
    id: "doubts",
    title: "Doubts",
    shortTitle: "Community",
    tag: "Social Learning",
    color: "bg-pink-600",
    lightColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    gradient: "from-pink-600 to-pink-700",
    progress: 15,
    streak: "5 doubts answered",
    desc: "Post doubts, get peer answers. Community-assisted clarification complements solo practice with collaborative problem-solving.",
    bullets: ["Doubt posting system", "Peer interaction flow", "Expert community answers", "Contextual question linking"],
  },
  {
    icon: BarChart2,
    id: "analytics",
    title: "Analytics",
    shortTitle: "My Stats",
    tag: "Performance Intel",
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    gradient: "from-teal-600 to-teal-700",
    progress: 84,
    streak: "68% overall accuracy",
    desc: "End-to-end accuracy trends, topic and chapter performance visibility, rank-style scoring and streak motivators in one unified view.",
    bullets: ["Accuracy & attempt trends", "Topic/chapter drill-down", "Rank & streak trackers", "Score progress timeline"],
  },
];

function ModuleTab({ mod, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all duration-200 select-none
        ${isActive
          ? `${mod.color} text-white shadow-lg scale-105`
          : `bg-white ${mod.textColor} border ${mod.borderColor} hover:scale-105`
        }`}
      style={{ minWidth: 72 }}
    >
      <mod.icon className="w-5 h-5" />
      <span className="text-[10px] font-bold whitespace-nowrap">{mod.shortTitle}</span>
    </button>
  );
}

export default function NeetModules() {
  const [activeId, setActiveId] = useState("dpp");
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef(null);

  const mod = modules.find((m) => m.id === activeId);

  const handleSelect = (id) => {
    setActiveId(id);
    setAnimKey((k) => k + 1);
  };

  return (
    <section id="modules" className="py-20 bg-[#F8FAFF]">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Product Modules</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            One App. Complete Prep Loop.
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Seven integrated modules covering every stage of the NEET preparation lifecycle.
          </p>
        </div>

        {/* ── MOBILE: Horizontal scroll tabs + detail card ── */}
        <div className="lg:hidden">
          {/* Continue where you left off */}
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${mod.color} flex items-center justify-center flex-shrink-0`}>
              <mod.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0f172a]">Continue where you left off</p>
              <p className={`text-xs font-semibold ${mod.textColor} truncate`}>{mod.title} — {mod.streak}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          {/* Horizontal scroll tabs */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-3 mb-5 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {modules.map((m) => (
              <ModuleTab key={m.id} mod={m} isActive={activeId === m.id} onClick={() => handleSelect(m.id)} />
            ))}
          </div>

          {/* Detail card */}
          <div
            key={animKey}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
          >
            {/* Colored header strip */}
            <div className={`bg-gradient-to-r ${mod.gradient} px-6 py-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <mod.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{mod.tag}</span>
                  <h3 className="text-white font-black text-lg leading-tight">{mod.title}</h3>
                </div>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-white/80 text-[10px] font-semibold mb-1">
                  <span>Progress</span>
                  <span>{mod.progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-700"
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
                <p className="text-white/70 text-[10px] mt-1.5 font-medium">{mod.streak}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{mod.desc}</p>
              <ul className="space-y-2.5">
                {mod.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className={`w-5 h-5 rounded-full ${mod.lightColor} flex items-center justify-center flex-shrink-0`}>
                      <div className={`w-2 h-2 rounded-full ${mod.color}`} />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: Side tab list + detail card ── */}
        <div className="hidden lg:flex gap-8">
          {/* Tab List */}
          <div className="w-64 flex flex-col gap-2">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left group
                  ${activeId === m.id
                    ? `${m.color} text-white shadow-md`
                    : `bg-white ${m.textColor} border ${m.borderColor} hover:scale-[1.02] hover:shadow-sm`
                  }`}
              >
                <m.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{m.title}</span>
                {activeId === m.id && (
                  <ArrowRight className="w-4 h-4 ml-auto flex-shrink-0 opacity-80" />
                )}
              </button>
            ))}
          </div>

          {/* Detail Panel */}
          <div
            key={`desk-${animKey}`}
            className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
          >
            {/* Colored header */}
            <div className={`bg-gradient-to-r ${mod.gradient} px-10 py-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <mod.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">{mod.tag}</span>
                  <h3 className="text-white font-black text-2xl">{mod.title}</h3>
                </div>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-white/80 text-xs font-semibold mb-1.5">
                  <span>Module Progress</span>
                  <span>{mod.progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="bg-white rounded-full h-2.5 transition-all duration-700"
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-2 font-medium">{mod.streak}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-10 py-8">
              <p className="text-gray-600 text-base leading-relaxed mb-7">{mod.desc}</p>
              <ul className="grid grid-cols-2 gap-3">
                {mod.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className={`w-5 h-5 rounded-full ${mod.lightColor} flex items-center justify-center flex-shrink-0`}>
                      <div className={`w-2 h-2 rounded-full ${mod.color}`} />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}