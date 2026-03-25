
import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { ArrowRight, Flame, CheckCircle, Zap, Calendar, TrendingUp } from "lucide-react";
import useSEO from "../hooks/useSEO";

const faqs = [
    { q: "What is a Daily Practice Problem (DPP) in NEET prep?", a: "A DPP is a curated daily set of 10–20 NEET-level questions across subjects. It builds consistent study habits and ensures you cover new questions every day rather than repeating the same material." },
    { q: "How many questions are in each daily practice set?", a: "Each DPP on NEETFORGE contains 10–20 questions, curated by subject and difficulty. You can complete it in 15–25 minutes." },
    { q: "Does NEETFORGE track streaks?", a: "Yes. NEETFORGE has a daily streak system that tracks your consecutive days of practice. Streak rewards and XP points keep you motivated." },
    { q: "Can I access past DPPs?", a: "Yes. All past DPPs are available in your history. You can revisit and re-attempt any previous practice set." },
];

export default function DailyPractice() {
    useSEO({
        title: "NEET Daily Practice Problems (DPP) 2025 — Build Consistency | NEETFORGE",
        description: "Solve 10–20 fresh NEET-level questions every day with NEETFORGE Daily Practice. Build consistency with streaks, timed solving, and weekly progress tracking. Free to start.",
        keywords: "NEET daily practice, NEET DPP, NEET daily practice problems, NEET practice questions daily, NEET 2025 preparation, NEET consistency",
        canonical: "https://neetforge.in/neet-daily-practice",
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
                    { "@type": "ListItem", "position": 2, "name": "NEET Daily Practice", "item": "https://neetforge.in/neet-daily-practice" }
                ]
            }
        ]
    });

    return (
        <LandingLayout>

            <section className="pt-28 pb-16 bg-gradient-to-br from-[#FFF7ED] via-white to-[#EFF6FF]">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <span className="inline-block bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        🔥 Daily Practice Problems
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        NEET Daily Practice —<br />
                        <span className="text-orange-500">Build the Habit That Cracks NEET</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        The most common reason NEET aspirants miss their target? Inconsistency. NEETFORGE's Daily Practice system ensures you solve fresh questions every single day — no exceptions.
                    </p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg text-base">
                        Start Today's DPP <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-4">How Daily Practice Improves Your NEET Score</h2>
                    <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">Regular daily practice is statistically the single strongest predictor of NEET performance improvement. Here's why it works:</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Flame, title: "Streak = Habit", desc: "Solving 15 questions daily for 60 days beats one 5-hour cramming session. NEETFORGE's streak system holds you accountable.", color: "bg-orange-50 text-orange-500" },
                            { icon: Calendar, title: "Fresh Questions Daily", desc: "Every day's DPP is freshly curated — no repetition. You're always encountering new question variations that reinforce concept depth.", color: "bg-blue-50 text-blue-600" },
                            { icon: TrendingUp, title: "Track Progress Weekly", desc: "See your week-on-week accuracy trend. Clear data shows you whether your consistency is actually translating into better scores.", color: "bg-green-50 text-green-600" },
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
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">What You Get in Daily Practice</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "10–20 fresh questions every day",
                            "Timed solving mode with countdown",
                            "Difficulty-tagged questions (Easy/Medium/Hard)",
                            "Subject-wise rotation (Physics, Chemistry, Biology)",
                            "Daily streak tracker with XP rewards",
                            "Leaderboard to compete with peers",
                            "Instant result after each DPP",
                            "Wrong questions added to revision queue",
                            "Weekly accuracy trend report",
                            "Accessible on mobile anytime",
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">FAQ — NEET Daily Practice</h2>
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
                    <h2 className="text-3xl font-black text-white mb-4">Start Your Daily Practice Streak</h2>
                    <p className="text-gray-400 mb-8">15 minutes a day, every day. That's how NEET toppers do it.</p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors text-base">
                        <Zap className="w-5 h-5" /> Begin Daily Practice Free
                    </a>
                </div>
            </section>
        </LandingLayout>
    );
}