import React from "react";

const stats = [
  { value: "10,000+", label: "Active Aspirants" },
  { value: "5L+", label: "Questions Practiced" },
  { value: "3 Subjects", label: "Physics, Chemistry, Biology" },
  { value: "360°", label: "Performance Loop" },
];

export default function NeetStats() {
  return (
    <section className="bg-[#0f172a] py-14">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-black text-[#2563EB] mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}