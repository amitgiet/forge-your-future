import React from "react";
import { PenLine, BarChart2, RefreshCw, Repeat2, TrendingUp } from "lucide-react";

const steps = [
  { icon: PenLine, num: "01", title: "Practice", color: "text-blue-600 bg-blue-50", desc: "Take daily practice sets, chapter quizzes, or full mock tests in NTA-style timed flow." },
  { icon: BarChart2, num: "02", title: "Analyze", color: "text-indigo-600 bg-indigo-50", desc: "AI dissects your performance — accuracy by topic, question-level mistakes, and weak-area ranking." },
  { icon: RefreshCw, num: "03", title: "Revise", color: "text-violet-600 bg-violet-50", desc: "Your revision queue auto-populates with the right questions at the right time — based on your history." },
  { icon: Repeat2, num: "04", title: "Reattempt", color: "text-green-600 bg-green-50", desc: "Re-solve flagged questions with fresh context. Build real understanding, not just answer memorization." },
  { icon: TrendingUp, num: "05", title: "Improve", color: "text-orange-600 bg-orange-50", desc: "Watch your accuracy trend upward, chapter by chapter, topic by topic — measurably, continuously." },
];

export default function NeetHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">The NEETFORGE Loop</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            How It Works
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            A closed improvement loop designed to turn every practice session into measurable score growth.
          </p>
        </div>

        {/* Loop */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-green-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`w-[72px] h-[72px] rounded-2xl ${s.color} flex flex-col items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-black text-gray-300 mb-1">{s.num}</div>
                <h3 className="font-black text-[#0f172a] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loop label */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg">
            <Repeat2 className="w-5 h-5 text-[#2563EB]" />
            This loop repeats — every session builds on the last.
          </div>
        </div>
      </div>
    </section>
  );
}