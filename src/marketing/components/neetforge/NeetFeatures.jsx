import React from "react";
import { Brain, BarChart2, RefreshCw, Smartphone, Zap, BookOpen } from "lucide-react";

const features = [
  {
    icon: Brain,
    color: "bg-blue-50 text-blue-600",
    title: "AI-Driven Analysis",
    desc: "Goes beyond raw scores. Detects your weak areas, shows why you're losing marks, and tells you exactly what to improve next.",
  },
  {
    icon: RefreshCw,
    color: "bg-indigo-50 text-indigo-600",
    title: "Smart Revision Loop",
    desc: "Neuronz-style revision queue based on your performance history. Revisit questions you got wrong — timed for maximum retention.",
  },
  {
    icon: BarChart2,
    color: "bg-green-50 text-green-600",
    title: "Deep Analytics",
    desc: "Track accuracy, attempt streaks, topic/chapter performance, and rank-style progress motivators all in one dashboard.",
  },
  {
    icon: Smartphone,
    color: "bg-orange-50 text-orange-600",
    title: "Mobile-First UX",
    desc: "Built for daily phone use. Optimized flows for solving, reviewing, and revising without friction — anytime, anywhere.",
  },
  {
    icon: Zap,
    color: "bg-yellow-50 text-yellow-600",
    title: "NTA-Style Player",
    desc: "Real-exam familiarity with a timed, NTA-interface test engine. Reduces exam-day anxiety through repeated practice.",
  },
  {
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600",
    title: "Structured Question Bank",
    desc: "Subject → Chapter → Topic navigation for targeted prep. Initiate practice directly from any point in the curriculum.",
  },
];

export default function NeetFeatures() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Why NEETFORGE</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            Everything You Need.<br />Nothing You Don't.
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Precision tools designed around the NEET preparation lifecycle — not generic study apps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-7 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0f172a] text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}