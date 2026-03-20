import React from "react";
import { Brain, BarChart2, RefreshCw, Smartphone, Zap, BookOpen } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Driven Analysis",
    desc: "Goes beyond raw scores. Detects your weak areas, shows why you're losing marks, and tells you exactly what to improve next.",
    iconBg: "bg-blue-500",
    accent: "border-blue-400/30",
    tag: "AI",
  },
  {
    icon: RefreshCw,
    title: "Smart Revision Loop",
    desc: "Neuronz-style revision queue based on your performance history. Revisit questions you got wrong — timed for maximum retention.",
    iconBg: "bg-indigo-500",
    accent: "border-indigo-400/30",
    tag: "Retention",
  },
  {
    icon: BarChart2,
    title: "Deep Analytics",
    desc: "Track accuracy, attempt streaks, topic/chapter performance, and rank-style progress motivators all in one dashboard.",
    iconBg: "bg-green-500",
    accent: "border-green-400/30",
    tag: "Insights",
  },
  {
    icon: Smartphone,
    title: "Mobile-First UX",
    desc: "Built for daily phone use. Optimized flows for solving, reviewing, and revising without friction — anytime, anywhere.",
    iconBg: "bg-orange-500",
    accent: "border-orange-400/30",
    tag: "Mobile",
  },
  {
    icon: Zap,
    title: "NTA-Style Player",
    desc: "Real-exam familiarity with a timed, NTA-interface test engine. Reduces exam-day anxiety through repeated practice.",
    iconBg: "bg-yellow-500",
    accent: "border-yellow-400/30",
    tag: "Exam Ready",
  },
  {
    icon: BookOpen,
    title: "Structured Question Bank",
    desc: "Subject → Chapter → Topic navigation for targeted prep. Initiate practice directly from any point in the curriculum.",
    iconBg: "bg-purple-500",
    accent: "border-purple-400/30",
    tag: "Question Bank",
  },
];

export default function NeetFeatures() {
  return (
    <section id="features" className="py-20 bg-[#0f172a] relative overflow-hidden">
      {/* Subtle background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Why NEETFORGE</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2">
            Everything You Need.<br />Nothing You Don't.
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Precision tools designed around the NEET preparation lifecycle — not generic study apps.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-all duration-300 hover:bg-white/8 hover:-translate-y-1 hover:shadow-2xl ${f.accent}`}
            >
              {/* Tag */}
              <span className="absolute top-4 right-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {f.tag}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>

              {/* Bottom accent line on hover */}
              <div className={`absolute bottom-0 left-6 right-6 h-px ${f.iconBg} opacity-0 group-hover:opacity-40 transition-opacity rounded-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}