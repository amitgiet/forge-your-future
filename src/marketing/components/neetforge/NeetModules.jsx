import React, { useState } from "react";
import { ClipboardList, FlaskConical, Cpu, BookMarked, CreditCard, MessageCircle, BarChart2 } from "lucide-react";

const modules = [
  {
    icon: ClipboardList,
    id: "dpp",
    title: "Daily Practice & DPP",
    tag: "Build Habit",
    color: "bg-blue-600",
    desc: "Daily curated practice sets with a timed solving flow. Build consistency through a routine challenge format that keeps you on track every single day.",
    bullets: ["Fresh curated questions daily", "Timed solving mode", "Consistency streaks & rewards", "Progress tracked over weeks"],
  },
  {
    icon: FlaskConical,
    id: "quiz",
    title: "Quiz & Test Engine",
    tag: "Practice Mode",
    color: "bg-indigo-600",
    desc: "Chapter/topic-based quizzes and fully custom test creation. Choose subject, chapter, and topic — then practice or compete against the clock.",
    bullets: ["Custom test creation", "NTA-style timed player", "Chapter/topic filtering", "Instant result breakdown"],
  },
  {
    icon: Cpu,
    id: "ai",
    title: "AI Quiz & Analysis",
    tag: "AI-Powered",
    color: "bg-violet-600",
    desc: "AI-assisted test generation and deep performance analysis. Know exactly which concepts to drop time on and which to revisit.",
    bullets: ["AI-generated question sets", "Weak area detection", "Concept-level performance mapping", "Improvement prioritization"],
  },
  {
    icon: BookMarked,
    id: "revision",
    title: "Revision System",
    tag: "Neuronz Flow",
    color: "bg-green-600",
    desc: "Adaptive revision queue driven by your actual attempt history. Resurface mistakes at the right time for long-term retention — not just one-time scoring.",
    bullets: ["Performance-based queue", "Revisit previously wrong Qs", "Spaced repetition logic", "Long-term retention focus"],
  },
  {
    icon: CreditCard,
    id: "formula",
    title: "Formula Cards",
    tag: "Rapid Review",
    color: "bg-orange-500",
    desc: "Swipe-based formula and concept cards for quick pre-test review. Palette/progress navigation to track your card coverage at a glance.",
    bullets: ["Swipe-based UX", "All subjects covered", "Progress palette view", "Pre-test rapid refresh"],
  },
  {
    icon: MessageCircle,
    id: "doubts",
    title: "Doubts & Community",
    tag: "Social Learning",
    color: "bg-pink-600",
    desc: "Post doubts, get peer answers. Community-assisted clarification complements solo practice with collaborative problem-solving.",
    bullets: ["Doubt posting system", "Peer interaction flow", "Expert community answers", "Contextual question linking"],
  },
  {
    icon: BarChart2,
    id: "analytics",
    title: "Analytics & Progress",
    tag: "Performance Intel",
    color: "bg-teal-600",
    desc: "End-to-end accuracy trends, topic and chapter performance visibility, rank-style scoring and streak motivators in one unified view.",
    bullets: ["Accuracy & attempt trends", "Topic/chapter drill-down", "Rank & streak trackers", "Score progress timeline"],
  },
];

export default function NeetModules() {
  const [active, setActive] = useState("dpp");
  const mod = modules.find((m) => m.id === active);

  return (
    <section id="modules" className="py-20 bg-[#F8FAFF]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Product Modules</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            One App. Complete Prep Loop.
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Seven integrated modules covering every stage of the NEET preparation lifecycle.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab List */}
          <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all text-left flex-shrink-0 ${
                  active === m.id
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 hover:bg-blue-50 hover:text-[#2563EB] border border-gray-100"
                }`}
              >
                <m.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{m.title}</span>
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl ${mod.color} flex items-center justify-center flex-shrink-0`}>
                <mod.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{mod.tag}</span>
                <h3 className="text-2xl font-black text-[#0f172a] mt-0.5">{mod.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-base leading-relaxed mb-7">{mod.desc}</p>
            <ul className="space-y-3">
              {mod.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}