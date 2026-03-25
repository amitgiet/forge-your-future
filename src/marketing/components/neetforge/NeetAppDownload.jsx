import React from "react";
import { Smartphone, Star, Users, ArrowRight } from "lucide-react";

const BACKEND_URL = "https://backend-forge-neet.onrender.com";

async function trackClick(buttonLabel) {
  try {
    await fetch(`${BACKEND_URL}/api/v1/marketing/track-download-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buttonLabel, referrer: window.location.href }),
    });
  } catch (_) {
    // Silently fail — tracking should never block the user
  }
}

export default function NeetAppDownload() {
  return (
    <section className="py-20 bg-[#F8FAFF]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563EB] rounded-3xl overflow-hidden relative">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center px-8 md:px-14 py-14">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" /> Available Now
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                Take Your Prep<br />Everywhere.
              </h2>
              <p className="text-blue-200 text-base leading-relaxed mb-8 max-w-sm">
                Practice in the bus, revise during breaks, solve daily DPPs before bed. NEETFORGE is designed for your phone — fast, focused, frictionless.
              </p>

              {/* Stats row */}
              <div className="flex gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-1 text-white font-black text-xl">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.8
                  </div>
                  <div className="text-blue-300 text-xs mt-0.5">App Rating</div>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <div className="flex items-center gap-1 text-white font-black text-xl">
                    <Users className="w-4 h-4 text-blue-300" /> 10K+
                  </div>
                  <div className="text-blue-300 text-xs mt-0.5">Active Users</div>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <div className="text-white font-black text-xl">Free</div>
                  <div className="text-blue-300 text-xs mt-0.5">To Download</div>
                </div>
              </div>

              {/* Store buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://drive.google.com/file/d/1w7RXkAbBp0i4oCf51Z7S045SZ6gJwV0d/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackClick("ios")}
                  className="flex items-center gap-3 bg-white text-[#1d4ed8] font-bold px-5 py-3 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
                >
                  <span className="text-xl leading-none">🍎</span>
                  <div className="text-left">
                    <div className="text-[10px] font-medium text-gray-500 leading-tight">Download on the</div>
                    <div className="font-black text-sm leading-tight">App Store</div>
                  </div>
                </a>
                <a
                  href="https://drive.google.com/file/d/1w7RXkAbBp0i4oCf51Z7S045SZ6gJwV0d/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackClick("android")}
                  className="flex items-center gap-3 bg-white text-[#1d4ed8] font-bold px-5 py-3 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
                >
                  <span className="text-xl leading-none">▶</span>
                  <div className="text-left">
                    <div className="text-[10px] font-medium text-gray-500 leading-tight">Get it on</div>
                    <div className="font-black text-sm leading-tight">Google Play</div>
                  </div>
                </a>
              </div>

              <a
                href="https://neetforge.in/app/"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackClick("web")}
                className="inline-flex items-center gap-2 text-blue-200 text-sm font-semibold mt-5 hover:text-white transition-colors"
              >
                Or use the web app instead <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right: QR code + phone mockup */}
            <div className="flex flex-col items-center gap-6 md:items-end">
              {/* QR Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center w-56">
                {/* QR code SVG — simple placeholder grid */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl mb-3 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer squares */}
                    <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke="#1d4ed8" strokeWidth="5" />
                    <rect x="13" y="13" width="12" height="12" rx="1" fill="#1d4ed8" />
                    <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke="#1d4ed8" strokeWidth="5" />
                    <rect x="75" y="13" width="12" height="12" rx="1" fill="#1d4ed8" />
                    <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke="#1d4ed8" strokeWidth="5" />
                    <rect x="13" y="75" width="12" height="12" rx="1" fill="#1d4ed8" />
                    {/* Inner data dots */}
                    {[
                      [42, 5], [50, 5], [58, 5], [42, 13], [58, 13], [42, 21], [50, 21],
                      [5, 42], [13, 42], [21, 42], [5, 50], [21, 50], [5, 58], [13, 58], [21, 58],
                      [42, 42], [50, 42], [58, 42], [67, 42], [75, 42], [42, 50], [67, 50],
                      [42, 58], [50, 58], [58, 58], [67, 58], [75, 58], [83, 58], [91, 58],
                      [42, 67], [50, 67], [67, 67], [83, 67],
                      [42, 75], [58, 75], [67, 75], [75, 75], [91, 75],
                      [42, 83], [50, 83], [58, 83], [83, 83],
                      [42, 91], [67, 91], [75, 91], [83, 91], [91, 91],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#1d4ed8" />
                    ))}
                  </svg>
                </div>
                <div className="text-[#1d4ed8] font-black text-sm mb-0.5">Scan to Download</div>
                <div className="text-gray-400 text-[10px] text-center">Point your camera at the QR code to get the app instantly</div>
              </div>

              {/* Badge row */}
              <div className="flex gap-3">
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
                  <div className="text-white font-black text-sm">iOS</div>
                  <div className="text-blue-300 text-[10px]">14+</div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
                  <div className="text-white font-black text-sm">Android</div>
                  <div className="text-blue-300 text-[10px]">8.0+</div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
                  <div className="text-white font-black text-sm">Web</div>
                  <div className="text-blue-300 text-[10px]">All browsers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
