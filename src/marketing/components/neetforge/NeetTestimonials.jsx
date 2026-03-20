import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Arjun P.",
    tag: "NEET 2025 Aspirant",
    initials: "AP",
    stars: 5,
    text: "The AI analysis feature is insane. After every test it shows exactly which topics I'm weak in — I stopped wasting time on things I already know. My accuracy in Biology went from 62% to 81% in 6 weeks.",
  },
  {
    name: "Meghna S.",
    tag: "Class 12 + NEET Dropper",
    initials: "MS",
    stars: 5,
    text: "NEETFORGE is the only app that actually made me revise my mistakes. The revision queue reminds me of questions I got wrong before — and I don't get them wrong anymore. My revision habit completely changed.",
  },
  {
    name: "Rahul K.",
    tag: "NEET 2025 — PCB Focus",
    initials: "RK",
    stars: 5,
    text: "The NTA-style test engine made me way less anxious during actual mocks. Formula cards before tests save so much time. Everything I need in one app — no switching between 5 different tools.",
  },
  {
    name: "Divya M.",
    tag: "Coaching + Self-Study",
    initials: "DM",
    stars: 5,
    text: "My coaching covers theory but doesn't give enough practice questions. NEETFORGE fills that gap perfectly. I solve 30+ questions every day now. The streak system keeps me consistent even on bad days.",
  },
];

export default function NeetTestimonials() {
  const [idx, setIdx] = useState(0);
  const t = testimonials[idx];

  return (
    <section className="py-20 bg-[#F8FAFF]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Student Results</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">What Aspirants Say</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(t.stars)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-10 italic max-w-2xl mx-auto">
            "{t.text}"
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-black text-sm">
              {t.initials}
            </div>
            <div className="text-left">
              <div className="font-black text-[#0f172a]">{t.name}</div>
              <div className="text-[#2563EB] text-sm font-semibold">{t.tag}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6 items-center">
          <button onClick={() => setIdx(i => (i === 0 ? testimonials.length - 1 : i - 1))}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === idx ? "bg-[#2563EB]" : "bg-gray-200"}`} />
            ))}
          </div>
          <button onClick={() => setIdx(i => (i === testimonials.length - 1 ? 0 : i + 1))}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}