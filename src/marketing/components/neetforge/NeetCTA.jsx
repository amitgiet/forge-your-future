import React from "react";
import { ArrowRight } from "lucide-react";

export default function NeetCTA() {
  return (
    <section className="py-20 bg-[#F8FAFF]">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="text-blue-300 font-bold text-sm uppercase tracking-widest mb-4">Ready to Forge Your Score?</div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Stop Studying Randomly.<br />Start Improving Systematically.
            </h2>
            <p className="text-blue-200 text-base leading-relaxed mb-10 max-w-lg mx-auto">
              Join thousands of NEET aspirants who've replaced guesswork with data-driven preparation. Your marks follow your method.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="/app/signup"
                className="flex items-center gap-2 bg-white text-[#1d4ed8] font-black px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg text-base">
                Start Free Today <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#features"
                className="text-blue-200 font-semibold text-sm hover:text-white transition-colors">
                Explore Features →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
