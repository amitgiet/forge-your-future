
import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { ArrowRight, RefreshCw, CheckCircle, Zap, Brain, Clock } from "lucide-react";
import useSEO from "../hooks/useSEO";

const faqs = [
    { q: "What is spaced repetition in NEET preparation?", a: "Spaced repetition is a proven memory technique where you revisit questions at increasing intervals — just before you're about to forget them. This maximises long-term retention with minimum revision time." },
    { q: "How does NeuronZ decide which questions to show?", a: "NeuronZ tracks every question you attempt. Wrong answers enter Level 1 (revisit in 24 hrs). As you answer correctly, questions move up levels — from short-term to long-term memory — with longer gaps between reviews." },
    { q: "How many questions are in the revision queue?", a: "Your queue grows based on your practice history. The more you attempt, the more questions accumulate in the system — ensuring you're always revising the right things at the right time." },
    { q: "Is the revision system available on the free plan?", a: "Basic revision queue is available on the free plan. Full spaced repetition with all 5 memory levels is a Pro feature." },
];

export default function NeetRevision() {
    useSEO({
        title: "NEET Revision System (NeuronZ) — Spaced Repetition for NEET 2025 | NEETFORGE",
        description: "NeuronZ is NEETFORGE's spaced repetition revision system for NEET. Revisit your wrong answers at the perfect interval across 5 memory levels. Never forget a topic again.",
        keywords: "NEET revision, NEET spaced repetition, NEET NeuronZ, NEET revision system, NEET memory technique, NEET 2025 revision, NEET wrong answer revision",
        canonical: "https://neetforge.in/neet-revision",
        jsonLd: [
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(f => ({
                    "@type": "Question",
                    "name": f.q,
                    "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://neetforge.in/" },
                    { "@type": "ListItem", "position": 2, "name": "NEET Revision System", "item": "https://neetforge.in/neet-revision" }
                ]
            }
        ]
    });

    return (
        <LandingLayout>

            <section className="pt-28 pb-16 bg-gradient-to-br from-[#F5F3FF] via-white to-[#EFF6FF]">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <span className="inline-block bg-green-50 border border-green-200 text-green-600 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        🧠 NeuronZ Revision System
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        NEET Revision That Actually Sticks —<br />
                        <span className="text-green-600">Spaced Repetition for Long-Term Memory</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        Most students re-read notes that they already know. NeuronZ makes you revisit exactly what you're about to forget — at the right time — so nothing slips through before exam day.
                    </p>
                    <a href="https://neetforge.in" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg text-base">
                        Start Revising Free <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-4">How NeuronZ Spaced Repetition Works</h2>
                    <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">Every question you attempt enters a 5-level memory ladder. Correct answers move up. Wrong answers drop back. You always study what matters most right now.</p>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {[
                            { level: "L1", title: "Temporary Memory", sub: "Revisit after 24 hours", color: "bg-pink-400", desc: "New wrong answers land here first. You'll see them again the next day." },
                            { level: "L2", title: "Short-Term (Encoding)", sub: "Revisit after 3 days", color: "bg-orange-400", desc: "You've seen it once. Review it again in 3 days to begin encoding." },
                            { level: "L3", title: "Repeating Short (Neurons)", sub: "Revisit after 5 days", color: "bg-purple-500", desc: "The memory is forming. One more review strengthens the neural pathway." },
                            { level: "L4", title: "Arriving Long Term", sub: "Revisit after 7 days", color: "bg-indigo-500", desc: "Almost locked in. A final review before moving to permanent memory." },
                            { level: "L5", title: "Retaining Long Term", sub: "Revisit after 10 days", color: "bg-blue-500", desc: "Fully encoded. You'll remember this on exam day." },
                        ].map((l, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                                <div className={`w-10 h-10 rounded-full ${l.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>{l.level}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-[#0f172a] text-sm">{l.title}</div>
                                    <div className="text-xs text-gray-400">{l.desc}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-xs font-bold text-gray-500">{l.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-[#F8FAFF]">
                <div className="max-w-4xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">What You Get with NeuronZ</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "Auto-populated revision queue from your practice history",
                            "5-level spaced repetition memory system",
                            "Wrong questions surface at optimal review intervals",
                            "Overall progress view (% mastered)",
                            "Subject-wise revision breakdown",
                            "Daily due count — always know what to review",
                            "Seamlessly links to your DPP and mock test mistakes",
                            "Mobile-first design for on-the-go revision",
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">FAQ — NEET Revision System</h2>
                    <div className="space-y-4">
                        {faqs.map((f, i) => (
                            <div key={i} className="border border-gray-200 rounded-2xl p-6">
                                <h3 className="font-bold text-[#0f172a] mb-2">{f.q}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 bg-[#0f172a] text-center">
                <div className="max-w-2xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-white mb-4">Never Forget a Topic Again</h2>
                    <p className="text-gray-400 mb-8">Let NeuronZ manage your revision schedule so you can focus on actually learning.</p>
                    <a href="https://neetforge.in" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-colors text-base">
                        <Zap className="w-5 h-5" /> Start Revision System Free
                    </a>
                </div>
            </section>
        </LandingLayout>
    );
}