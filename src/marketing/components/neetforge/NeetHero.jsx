import React, { useState, useEffect } from "react";
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

const pills = ["Daily Practice", "AI Analysis", "Adaptive Revision", "NTA-Style Tests", "Formula Cards"];

// ── Screen 1: Home Dashboard ──────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div className="h-full bg-[#F4F6FB] flex flex-col text-[#0f172a]">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[#2563EB] font-black text-base tracking-tight">NEET<span className="text-[#0f172a]">FORGE</span></span>
          <p className="text-[10px] text-gray-500 mt-0.5">Let's crush today's goals 💪</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-black text-xs">A</div>
      </div>

      {/* Stats row */}
      <div className="px-3 py-3 grid grid-cols-3 gap-2">
        {[{ emoji: "🔥", val: "15", label: "DAY STREAK" }, { emoji: "⭐", val: "725", label: "SCORE" }, { emoji: "🏆", val: "#1", label: "RANK" }].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 text-center shadow-sm">
            <div className="text-base mb-0.5">{s.emoji}</div>
            <div className="font-black text-sm text-[#0f172a]">{s.val}</div>
            <div className="text-[8px] text-gray-400 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Progress */}
      <div className="mx-3 bg-white rounded-xl p-3 shadow-sm mb-2">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500 text-xs">⚡</span>
          <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-wide">Today's Progress</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><div className="text-sm font-black text-[#2563EB]">46m</div><div className="text-[8px] text-gray-400">STUDY TIME</div></div>
          <div><div className="text-sm font-black text-green-500">34</div><div className="text-[8px] text-gray-400">QUESTIONS</div></div>
          <div><div className="text-sm font-black text-orange-500">68%</div><div className="text-[8px] text-gray-400">ACCURACY</div></div>
        </div>
      </div>

      {/* Daily DPP */}
      <div className="mx-3 bg-white rounded-xl p-3 shadow-sm mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px]">🎯</span>
            <span className="text-[10px] font-black">Daily DPP</span>
          </div>
          <span className="text-[8px] text-[#2563EB] font-bold">🏆 Leaderboard</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 mb-2">
          <div className="flex gap-1 mb-1">
            <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">hard</span>
            <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">chemistry</span>
          </div>
          <p className="text-[10px] font-bold text-[#0f172a] leading-snug">Catalysis: Enzymes as biological catalysts.</p>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[8px] text-gray-400">⏱ 12 min</span>
          <span className="text-[8px] text-yellow-500 font-bold">⚡ +200 XP</span>
        </div>
        <div className="bg-[#2563EB] rounded-xl py-2 text-center text-white text-[10px] font-black">🎯 Start DPP &gt;</div>
      </div>

      {/* Quick Actions */}
      <div className="mx-3">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500 text-xs">⚡</span>
          <span className="text-[10px] font-black uppercase tracking-wide">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ e: "📋", t: "Formulas", s: "Cards" }, { e: "📝", t: "Mock Test", s: "Series" }, { e: "🧠", t: "Revision", s: "Spaced" }].map((a) => (
            <div key={a.t} className="bg-white rounded-xl p-2 text-center shadow-sm">
              <div className="text-lg mb-0.5">{a.e}</div>
              <div className="text-[9px] font-bold">{a.t}</div>
              <div className="text-[8px] text-gray-400">{a.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: AI Quiz Generator ───────────────────────────────────────────────
function AIQuizScreen() {
  return (
    <div className="h-full bg-[#F4F6FB] flex flex-col text-[#0f172a]">
      <div className="bg-white px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm">✨</span>
          <span className="font-black text-sm">AI Quiz Generator</span>
        </div>
        <p className="text-[9px] text-gray-400">Create custom quizzes on any topic</p>
      </div>

      <div className="flex-1 px-3 py-3 space-y-3 overflow-hidden">
        <div className="bg-white rounded-xl px-3 py-2 text-center text-[10px] font-bold text-[#2563EB] border border-blue-100">📖 My Quizzes &gt;</div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black text-gray-500 mb-1.5 uppercase">Topic</div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-[9px] text-gray-400">e.g., Photosynthesis, Newton's Laws</div>
          <div className="text-[8px] text-orange-500 mt-1">Be specific for better results</div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black mb-2">Difficulty: <span className="text-[#2563EB]">L3</span></div>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7].map((n) => (
              <div key={n} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${n === 3 ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-500"}`}>{n}</div>
            ))}
          </div>
          <div className="text-[7px] text-gray-400 mt-1">L1 = Basic · L7 = Competitive</div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black mb-2">Questions: <span className="text-[#2563EB]">10</span></div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 relative">
            <div className="bg-[#2563EB] h-1.5 rounded-full" style={{width:"20%"}} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#2563EB] rounded-full shadow" style={{left:"calc(20% - 6px)"}} />
          </div>
          <div className="flex justify-between text-[7px] text-gray-400 mt-0.5"><span>1</span><span>50</span></div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black mb-2">Quiz Type</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-[#2563EB] rounded-xl p-2 text-center">
              <div className="text-[9px] font-black text-[#2563EB]">MCQ</div>
              <div className="text-[7px] text-gray-400">Single answer</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-2 text-center bg-gray-50">
              <div className="text-[9px] font-bold text-gray-600">Multi Select</div>
              <div className="text-[7px] text-gray-400">Multiple answers</div>
            </div>
          </div>
        </div>

        <div className="bg-[#2563EB] rounded-xl py-2.5 text-center text-white text-[10px] font-black">✨ Generate Quiz</div>
      </div>
    </div>
  );
}

// ── Screen 3: NeuronZ Revision ─────────────────────────────────────────────────
function NeuronZScreen() {
  const levels = [
    { name: "L1 · Temporary Memory", sub: "After 24 hrs", color: "bg-pink-400" },
    { name: "L2 · Short Term (Encoding)", sub: "After 3 days", color: "bg-orange-400" },
    { name: "L3 · Repeating Short (Neurons)", sub: "After 5 days", color: "bg-purple-500" },
    { name: "L4 · Arriving Long Term", sub: "After 7 days", color: "bg-indigo-500" },
    { name: "L5 · Retaining Long Term", sub: "After 10 days", color: "bg-blue-500" },
  ];
  return (
    <div className="h-full bg-[#F4F6FB] flex flex-col text-[#0f172a]">
      <div className="bg-white px-4 pt-5 pb-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center"><span className="text-white text-xs">🧠</span></div>
        <div>
          <div className="font-black text-sm">NeuronZ</div>
          <div className="text-[9px] text-gray-400">Spaced Repetition System</div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3 overflow-hidden space-y-2">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5">
          <p className="text-[9px] text-blue-700 leading-snug">⚡ Practice questions enter Level 1. Answer correctly to move them up the memory ladder.</p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[9px]">🏆</span>
            <span className="text-[9px] font-black">Overall Progress</span>
            <span className="ml-auto text-[9px] font-black text-[#2563EB]">0/0</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-[#2563EB] h-1.5 rounded-full w-0" />
          </div>
          <div className="text-[7px] text-gray-400 mt-1">0% mastered · Keep practicing to build strong memory</div>
        </div>

        {levels.map((l) => (
          <div key={l.name} className="bg-white rounded-xl px-3 py-2 shadow-sm flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${l.color} flex items-center justify-center text-white text-[8px]`}>●</div>
            <div className="flex-1">
              <div className="text-[9px] font-bold">{l.name}</div>
              <div className="text-[7px] text-gray-400">{l.sub}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black">0</div>
              <div className="text-[7px] text-gray-400">QUESTIONS</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 4: AI Study Assistant ─────────────────────────────────────────────
function AIAssistantScreen() {
  return (
    <div className="h-full bg-[#F4F6FB] flex flex-col text-[#0f172a]">
      <div className="bg-white px-4 pt-5 pb-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center"><span className="text-white text-xs">✨</span></div>
        <div>
          <div className="font-black text-sm">AI Study Assistant</div>
          <div className="text-[9px] text-gray-400">Powered by your study data</div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="bg-white px-3 pb-2 flex gap-2">
          {["Coach","Analysis","Doubt"].map((t, i) => (
            <span key={t} className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${i===0?"bg-[#2563EB] text-white":"bg-gray-100 text-gray-500"}`}>{t}</span>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-6 overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center mb-3">
            <span className="text-white text-xl">💬</span>
          </div>
          <div className="text-sm font-black text-center mb-1">Hi Bharat kumar khati! 👋</div>
          <p className="text-[9px] text-gray-400 text-center mb-5">I can help you analyze your performance and study better</p>

          <div className="w-full space-y-2">
            {[
              { emoji: "📈", text: "What are my weak points?", border: "border-gray-200" },
              { emoji: "📖", text: "Review my last quiz", border: "border-blue-300 bg-blue-50" },
              { emoji: "🎯", text: "Build my today plan", border: "border-gray-200" },
            ].map((q) => (
              <div key={q.text} className={`border ${q.border} rounded-xl px-3 py-2.5 flex items-center gap-2 bg-white`}>
                <span className="text-xs">{q.emoji}</span>
                <span className="text-[9px] font-semibold text-gray-700">{q.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="px-3 py-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <span className="text-[9px] text-gray-400 flex-1">Review my last quiz</span>
            <span className="text-xs">🎙</span>
            <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center"><span className="text-white text-[8px]">➤</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 5: Part Test Series ────────────────────────────────────────────────
function TestSeriesScreen() {
  const tests = [
    { name: "All in One Toppers Test series Part-Test 1 (Neet 2026)", meta: "200 min · 90 Qs · Other", free: true },
    { name: "All in One Toppers Test series Full-Test 2 (Neet 2026)", meta: "200 min · 180 Qs · Other", free: true },
    { name: "All in One Toppers Test series Full-Test 3 (Neet 2026)", meta: "200 min · 180 Qs · Other", free: false },
  ];
  return (
    <div className="h-full bg-[#F4F6FB] flex flex-col text-[#0f172a]">
      <div className="bg-white px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <div className="font-black text-sm">Part Test</div>
          <div className="text-[9px] text-gray-400">29 tests</div>
        </div>
        <span className="text-gray-400 text-sm">☰</span>
      </div>

      <div className="px-3 pt-2 mb-2">
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-gray-400 text-[10px]">🔍</span>
          <span className="text-[9px] text-gray-400">Search tests...</span>
        </div>
      </div>

      <div className="flex-1 px-3 space-y-2 overflow-hidden">
        {tests.map((t, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0"><span className="text-[8px]">📄</span></div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[9px] font-bold leading-snug flex-1">{t.name}</p>
                  {t.free && <span className="text-[7px] bg-green-100 text-green-600 font-black px-1.5 py-0.5 rounded-full flex-shrink-0">FREE</span>}
                </div>
                <div className="text-[7px] text-gray-400 mt-0.5">{t.meta}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="border border-blue-200 rounded-lg py-1 text-center text-[8px] text-[#2563EB] font-bold">📄 Questions</div>
              <div className="border border-green-200 rounded-lg py-1 text-center text-[8px] text-green-600 font-bold">✅ Solutions</div>
            </div>
            <div className="bg-[#2563EB] rounded-xl py-1.5 text-center text-white text-[9px] font-black">Mark Complete</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const screens = [
  {
    component: HomeScreen,
    chips: [
      { text: "🔥 12-Day Streak!", pos: "top-16 -left-12", style: "bg-white border border-gray-200 text-gray-800" },
      { text: "✓ AI Analyzed", pos: "top-1/2 -right-12", style: "bg-[#2563EB] text-white" },
      { text: "🎯 Weak area fixed", pos: "bottom-20 -left-8", style: "bg-green-50 border border-green-200 text-green-700" },
    ],
  },
  {
    component: AIQuizScreen,
    chips: [
      { text: "✨ AI Powered", pos: "top-16 -left-12", style: "bg-violet-600 text-white" },
      { text: "📊 L3 Difficulty", pos: "top-1/2 -right-12", style: "bg-white border border-gray-200 text-gray-800" },
      { text: "⚡ Instant Quiz", pos: "bottom-20 -left-8", style: "bg-yellow-50 border border-yellow-300 text-yellow-700" },
    ],
  },
  {
    component: NeuronZScreen,
    chips: [
      { text: "🧠 Spaced Recall", pos: "top-16 -left-12", style: "bg-purple-600 text-white" },
      { text: "📈 7 Memory Levels", pos: "top-1/2 -right-12", style: "bg-white border border-gray-200 text-gray-800" },
      { text: "✅ Long-Term Retention", pos: "bottom-20 -left-8", style: "bg-green-50 border border-green-200 text-green-700" },
    ],
  },
  {
    component: AIAssistantScreen,
    chips: [
      { text: "🤖 AI Coach", pos: "top-16 -left-12", style: "bg-[#2563EB] text-white" },
      { text: "📉 Weak Points", pos: "top-1/2 -right-12", style: "bg-white border border-gray-200 text-gray-800" },
      { text: "🗓 Smart Study Plan", pos: "bottom-20 -left-8", style: "bg-orange-50 border border-orange-200 text-orange-700" },
    ],
  },
  {
    component: TestSeriesScreen,
    chips: [
      { text: "📄 200+ Tests", pos: "top-16 -left-12", style: "bg-white border border-gray-200 text-gray-800" },
      { text: "🆓 Free Access", pos: "top-1/2 -right-12", style: "bg-green-500 text-white" },
      { text: "⏱ NTA Pattern", pos: "bottom-20 -left-8", style: "bg-[#2563EB] text-white" },
    ],
  },
];

export default function NeetHero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = slide left

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % screens.length);
        setAnimating(false);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    if (idx === current) return;
    setDirection(idx > current ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const Screen = screens[current].component;
  const chips = screens[current].chips;

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4]">
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

          <div className="flex flex-wrap gap-2 mb-10">
            {pills.map((p) => (
              <span key={p} className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full shadow-sm">{p}</span>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="https://neetforge.vercel.app" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-[#2563EB] text-white font-bold px-7 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-base">
              Start Practicing Free <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-[#2563EB] transition-colors">
              See How It Works →
            </a>
          </div>

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

        {/* Right — Phone */}
        <div className="relative flex justify-center">
          <div className="relative w-[280px] md:w-[300px]">
            {/* Phone frame */}
            <div className="bg-[#0f172a] rounded-[3rem] p-3 shadow-2xl shadow-blue-200/50">
              <div className="rounded-[2.5rem] overflow-hidden" style={{ height: "560px" }}>
                {/* Animated screen content */}
                <div
                  className="h-full transition-all duration-400"
                  style={{
                    opacity: animating ? 0 : 1,
                    transform: animating
                      ? `translateX(${direction * 30}px)`
                      : "translateX(0)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                  }}
                >
                  <Screen />
                </div>
              </div>
            </div>

            {/* Floating chips — animated per screen */}
            {chips.map((chip, i) => (
              <div
                key={`${current}-${i}`}
                className={`absolute ${chip.pos} ${chip.style} rounded-2xl shadow-lg px-3 py-2 text-xs font-bold whitespace-nowrap`}
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? "scale(0.8)" : "scale(1)",
                  transition: `opacity 0.35s ease ${i * 0.08}s, transform 0.35s ease ${i * 0.08}s`,
                }}
              >
                {chip.text}
              </div>
            ))}

            {/* Dot indicators */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {screens.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-[#2563EB]" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}