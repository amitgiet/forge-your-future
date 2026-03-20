import React from "react";
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

const pills = ["Daily Practice", "AI Analysis", "Adaptive Revision", "NTA-Style Tests", "Formula Cards"];

export default function NeetHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4]">
      {/* BG blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -z-0 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl -z-0 -translate-x-1/3" />

      <div className="relative max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> AI-Powered NEET Prep
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-[1.1] text-[#0f172a] mb-6">
            Convert <span className="text-[#2563EB]">Effort</span><br />
            Into <span className="relative">
              Marks
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6 Q100 1 198 6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
            NEETFORGE closes the loop between <strong className="text-gray-700">Practice → Analyze → Revise → Reattempt → Improve.</strong> Stop guessing what to study next.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {pills.map((p) => (
              <span key={p} className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full shadow-sm">
                {p}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="/app/signup"
              className="flex items-center gap-2 bg-[#2563EB] text-white font-bold px-7 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-base">
              Start Practicing Free <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works"
              className="text-sm font-semibold text-gray-600 hover:text-[#2563EB] transition-colors">
              See How It Works →
            </a>
          </div>

          {/* Mini trust bar */}
          <div className="flex items-center gap-6 mt-10 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Target className="w-4 h-4 text-[#2563EB]" /> NTA-Style Player
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" /> AI Weak-Area Detection
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Zap className="w-4 h-4 text-[#2563EB]" /> Daily Practice Streaks
            </div>
          </div>
        </div>

        {/* Right - App mockup */}
        <div className="relative flex justify-center">
          <div className="relative w-[280px] md:w-[320px]">
            {/* Phone frame */}
            <div className="bg-[#0f172a] rounded-[3rem] p-3 shadow-2xl shadow-blue-200/50">
              <div className="bg-[#EFF6FF] rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                {/* Mock screen */}
                <div className="p-4 h-full flex flex-col">
                  <div className="text-center mb-4 pt-2">
                    <span className="text-[#2563EB] font-black text-lg tracking-tight">NEETFORGE</span>
                  </div>
                  
                  {/* Quiz card */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-[#2563EB] font-bold px-2 py-0.5 rounded-full">Biology • Ch 12</span>
                      <span className="text-xs text-gray-400 ml-auto">⏱ 1:42</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-snug mb-3">
                      Which of the following is the correct sequence in the lytic cycle?
                    </p>
                    {["Adsorption → Injection → Synthesis → Assembly → Lysis",
                      "Injection → Adsorption → Lysis → Assembly",
                      "Assembly → Synthesis → Injection → Lysis",
                    ].map((opt, i) => (
                      <div key={i} className={`text-[10px] p-2 rounded-lg mb-1.5 font-medium ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600"}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                      <span className="font-semibold">Today's Progress</span>
                      <span className="text-[#2563EB] font-bold">24/30</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-[#2563EB] h-2 rounded-full" style={{width: "80%"}} />
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 text-white flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="text-xs font-black">12-Day Streak!</div>
                      <div className="text-[10px] text-blue-100">Keep it going</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-8 top-16 bg-white rounded-2xl shadow-lg px-3 py-2 text-xs font-bold text-gray-800 border border-gray-100">
              📈 +18% accuracy
            </div>
            <div className="absolute -right-8 top-1/2 bg-[#2563EB] rounded-2xl shadow-lg px-3 py-2 text-xs font-bold text-white">
              ✓ AI Analyzed
            </div>
            <div className="absolute -left-6 bottom-20 bg-green-50 border border-green-200 rounded-2xl shadow px-3 py-2 text-xs font-bold text-green-700">
              🎯 Weak area fixed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
