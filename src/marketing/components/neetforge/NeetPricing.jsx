import React from "react";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Get started with core practice tools.",
    cta: "Start Free",
    ctaClass: "border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50",
    features: [
      "Daily Practice (DPP)",
      "Basic quiz engine",
      "Chapter/topic navigation",
      "Limited daily questions",
      "Basic progress tracking",
      "Formula cards (preview)",
    ],
    muted: [3, 4],
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    desc: "Full NEET prep power. Everything you need to crack it.",
    cta: "Get Pro Access",
    ctaClass: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Full-length NTA mock tests",
      "Unlimited question bank access",
      "AI quiz generation & analysis",
      "Smart revision queue (Neuronz)",
      "Deep analytics & rank tracker",
      "All formula cards",
      "Doubt posting & community",
      "Priority support",
    ],
    highlight: true,
  },
];

export default function NeetPricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-2">
            Simple. Transparent. Worth It.
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Start free, upgrade when you're ready for the full improvement engine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`relative rounded-3xl p-8 border transition-all ${plan.highlight
                ? "bg-[#0f172a] border-[#0f172a] shadow-2xl scale-[1.02]"
                : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
              }`}>

              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#2563EB] text-white text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {plan.badge}
                  </span>
                </div>
              )}

              <div className={`mb-6 ${plan.highlight ? "text-white" : "text-[#0f172a]"}`}>
                <div className="font-black text-lg mb-1">{plan.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className={`text-base mb-2 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mt-2 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
              </div>

              <a href={plan.name === 'Free' ? '/app/signup' : '/app/login'}
                className={`block text-center w-full py-3.5 rounded-2xl font-bold text-sm transition-all mb-7 ${plan.ctaClass}`}>
                {plan.cta}
              </a>

              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-blue-900" : "bg-blue-50"}`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? "text-blue-400" : "text-[#2563EB]"}`} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
