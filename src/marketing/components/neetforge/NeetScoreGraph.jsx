import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, Award, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const students = [
  {
    name: "Arjun P.",
    initials: "AP",
    tag: "Biology specialist",
    color: "#2563EB",
    data: [
      { week: "W1", score: 310 },
      { week: "W2", score: 345 },
      { week: "W3", score: 370 },
      { week: "W4", score: 390 },
      { week: "W5", score: 425 },
      { week: "W6", score: 468 },
      { week: "W7", score: 510 },
      { week: "W8", score: 552 },
    ],
    from: 310,
    to: 552,
    improvement: "+242",
  },
  {
    name: "Meghna S.",
    initials: "MS",
    tag: "Chemistry focus",
    color: "#7c3aed",
    data: [
      { week: "W1", score: 290 },
      { week: "W2", score: 315 },
      { week: "W3", score: 348 },
      { week: "W4", score: 372 },
      { week: "W5", score: 400 },
      { week: "W6", score: 440 },
      { week: "W7", score: 475 },
      { week: "W8", score: 520 },
    ],
    from: 290,
    to: 520,
    improvement: "+230",
  },
  {
    name: "Rahul K.",
    initials: "RK",
    tag: "Physics + Chem",
    color: "#059669",
    data: [
      { week: "W1", score: 340 },
      { week: "W2", score: 360 },
      { week: "W3", score: 385 },
      { week: "W4", score: 412 },
      { week: "W5", score: 445 },
      { week: "W6", score: 480 },
      { week: "W7", score: 515 },
      { week: "W8", score: 568 },
    ],
    from: 340,
    to: 568,
    improvement: "+228",
  },
];

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-white text-xs">
        <div className="font-black text-sm">{payload[0].value}</div>
        <div className="text-gray-400">{label}</div>
      </div>
    );
  }
  return null;
};

export default function NeetScoreGraph() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const student = students[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset animation when switching student
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Real Results</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            Scores Don't Lie.
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Consistent daily practice + smart revision = measurable score growth. See it in 8 weeks.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left: student cards */}
          <div className="flex flex-row lg:flex-col gap-3 lg:w-56">
            {students.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-1 lg:flex-none text-left px-4 py-4 rounded-2xl border transition-all duration-200 ${
                  active === i
                    ? "bg-[#0f172a] border-[#0f172a] text-white shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.initials}
                  </div>
                  <div>
                    <div className={`font-bold text-sm leading-tight ${active === i ? "text-white" : "text-[#0f172a]"}`}>{s.name}</div>
                    <div className={`text-[10px] font-medium ${active === i ? "text-gray-400" : "text-gray-500"}`}>{s.tag}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <span className="font-black text-sm" style={{ color: s.color }}>{s.improvement} pts</span>
                  <span className={`text-[10px] ${active === i ? "text-gray-400" : "text-gray-500"}`}>in 8 weeks</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: chart */}
          <div className="flex-1 bg-[#0f172a] rounded-3xl p-6 md:p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: student.color }} />

            {/* Top stats */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <div className="text-gray-400 text-xs font-semibold mb-1">Score Journey — {student.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-2xl font-black">{student.from}</span>
                  <TrendingUp className="w-5 h-5" style={{ color: student.color }} />
                  <span className="text-white text-2xl font-black">{student.to}</span>
                  <span className="font-black text-sm px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: student.color }}>
                    {student.improvement}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <Award className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-white font-black text-sm">8 wks</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">Timeframe</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <Target className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-white font-black text-sm">720</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">Target</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative z-10" style={{ height: 220 }}>
              {visible && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={student.data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id={`grad-${active}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={student.color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={student.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", 720]} />
                    <Tooltip content={<CustomTooltip color={student.color} />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={student.color}
                      strokeWidth={3}
                      fill={`url(#grad-${active})`}
                      dot={{ r: 4, fill: student.color, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: student.color }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Target line label */}
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <div className="w-8 h-px border-t-2 border-dashed border-green-400/60" />
              <span className="text-green-400 text-[10px] font-bold">Target: 720 (Perfect NEET Score)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}