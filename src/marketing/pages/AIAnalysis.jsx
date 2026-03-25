import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { ArrowRight, Brain, BarChart2, AlertTriangle, CheckCircle, Zap, Target } from "lucide-react";
import useSEO from "../hooks/useSEO";

const faqs = [
    { q: "How does AI analysis detect weak chapters?", a: "NEETFORGE's AI maps every question you attempt to a specific chapter and topic. It tracks your accuracy per concept, detects where your error rate is highest, and surfaces those areas as priority revision targets." },
    { q: "Is the AI analysis available on the free plan?", a: "Basic analysis is available on the free plan. Deep AI analysis, weak-area prioritization, and concept-level error mapping are Pro features." },
    { q: "How is this different from just seeing my test score?", a: "A score tells you how many marks you got. AI analysis tells you *why* — which exact chapters cost you marks, whether errors are conceptual or calculation-based, and what to fix next." },
    { q: "Does AI generate custom quizzes based on my weak areas?", a: "Yes. After AI analysis detects your weak chapters, you can instantly generate a targeted quiz that focuses exclusively on those problem areas." },
];

export default function AIAnalysis() {
    useSEO({
        title: "NEET AI Analysis — Weak Chapter Detection & Score Improvement | NEETFORGE",
        description: "NEETFORGE AI detects your weak NEET chapters, maps concept-level errors, and generates targeted quizzes to fix them. Stop guessing — know exactly what to study next.",
        keywords: "NEET AI analysis, NEET weak chapter detection, NEET performance analysis, NEET AI study tool, NEET score improvement, NEET 2025 AI",
        canonical: "https://neetforge.in/neet-ai-analysis",
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
                    { "@type": "ListItem", "position": 2, "name": "NEET AI Analysis", "item": "https://neetforge.in/neet-ai-analysis" }
                ]
            }
        ]
    });

    return (
        <LandingLayout>

            <section className="pt-28 pb-16 bg-gradient-to-br from-[#F5F3FF] via-white to-[#EFF6FF]">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <span className="inline-block bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        ✨ AI-Powered
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        NEET AI Analysis —<br />
                        <span className="text-violet-600">Know Exactly What's Costing You Marks</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        Most NEET aspirants know their score but don't know why they lost marks. NEETFORGE AI goes beyond the number — it maps your mistakes to chapters, detects patterns, and tells you exactly what to fix.
                    </p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-violet-700 transition-colors shadow-lg text-base">
                        Try AI Analysis Free <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-4">Why Knowing Your Weak Chapters Changes Everything</h2>
                    <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">Studying without analysis is studying blind. Here's what NEETFORGE AI gives you that no generic study app can:</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Brain, title: "Concept-Level Error Mapping", desc: "AI doesn't just say 'Biology was weak'. It shows you: 'Genetics — Mendelian Inheritance — 43% accuracy. Fix this first.'", color: "bg-violet-50 text-violet-600" },
                            { icon: AlertTriangle, title: "Weak Area Prioritization", desc: "NEETFORGE ranks your weak areas by score impact. You always know which chapter, if improved, would give you the most additional marks.", color: "bg-red-50 text-red-500" },
                            { icon: Target, title: "Auto-Generated Fix Quizzes", desc: "After detecting weakness, AI instantly creates a targeted quiz on those chapters. No need to manually hunt for relevant questions.", color: "bg-blue-50 text-blue-600" },
                        ].map((item, i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-[#0f172a] text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-[#F8FAFF]">
                <div className="max-w-4xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">What AI Analysis Shows You</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "Subject-wise accuracy (Physics / Chemistry / Biology)",
                            "Chapter-level performance breakdown",
                            "Topic-level error pattern detection",
                            "Accuracy trend over time (week/month)",
                            "Most frequently wrong question types",
                            "Weak area priority rank (by score impact)",
                            "Conceptual vs. calculation error classification",
                            "AI-generated targeted quiz on weak chapters",
                            "Progress comparison before/after revision",
                            "Personalized study recommendations",
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">FAQ — NEET AI Analysis</h2>
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
                    <h2 className="text-3xl font-black text-white mb-4">Stop Guessing. Start Fixing.</h2>
                    <p className="text-gray-400 mb-8">Let AI show you exactly which chapters to focus on next.</p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-violet-700 transition-colors text-base">
                        <Zap className="w-5 h-5" /> Analyse My Performance Free
                    </a>
                </div>
            </section>
        </LandingLayout>
    );
}