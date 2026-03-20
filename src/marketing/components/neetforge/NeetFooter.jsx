import React from "react";

const links = {
  Product: ["Features", "Modules", "How It Works", "Pricing", "Demo"],
  Prep: ["Daily Practice", "Mock Tests", "Formula Cards", "Revision System", "Analytics"],
  Company: ["About", "Careers", "Blog", "Contact"],
};

export default function NeetFooter() {
  return (
    <footer className="bg-[#0f172a] text-gray-400">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="text-[#2563EB] font-black text-2xl tracking-tight mb-3">
              NEET<span className="text-white">FORGE</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-6">
              The performance-first NEET preparation app. Practice → Analyze → Revise → Improve. Continuously.
            </p>
            <a href="/app/login"
              className="inline-block bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
              Open App →
            </a>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 text-sm hover:text-[#2563EB] transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div>© {new Date().getFullYear()} NEETFORGE. All Rights Reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
