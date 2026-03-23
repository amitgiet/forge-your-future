
import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { ArrowRight, CreditCard, CheckCircle, Zap, BookOpen, LayoutGrid } from "lucide-react";
import useSEO from "../hooks/useSEO";

const faqs = [
    { q: "Which subjects do formula cards cover?", a: "NEETFORGE formula cards cover all three NEET subjects — Physics (laws, equations, constants), Chemistry (reactions, formulas, periodic trends), and Biology (key facts, diagrams, mnemonics)." },
    { q: "How do I use formula cards before a test?", a: "Open the Formula Cards module, select your subject or chapter, and swipe through cards rapidly. The palette view shows your coverage — green means reviewed, grey means pending." },
    { q: "Can I track which cards I've reviewed?", a: "Yes. The progress palette shows every card's status at a glance. You always know how much you've covered and what's left." },
    { q: "Are formula cards free?", a: "A preview of formula cards is available on the free plan. Full access to all subjects and chapters is a Pro feature." },
];

const subjects = [
    { name: "Physics", color: "bg-blue-50 text-blue-600 border-blue-200", topics: ["Kinematics", "Newton's Laws", "Thermodynamics", "Optics", "Modern Physics", "Electrostatics", "Magnetism", "Waves"] },
    { name: "Chemistry", color: "bg-purple-50 text-purple-600 border-purple-200", topics: ["Periodic Table", "Chemical Bonding", "Electrochemistry", "Organic Reactions", "Coordination Compounds", "Thermochemistry"] },
    { name: "Biology", color: "bg-green-50 text-green-600 border-green-200", topics: ["Cell Biology", "Genetics", "Human Physiology", "Plant Physiology", "Ecology", "Evolution", "Biotechnology"] },
];

export default function FormulaCards() {
    useSEO({
        title: "NEET Formula Cards — Physics, Chemistry & Biology Quick Review | NEETFORGE",
        description: "Swipe through NEET formula cards for Physics, Chemistry, and Biology. Rapid pre-test review with progress tracking. All key equations, reactions, and facts in one place.",
        keywords: "NEET formula cards, NEET physics formulas, NEET chemistry formulas, NEET biology notes, NEET quick revision cards, NEET 2025 formula sheet",
        canonical: "https://neetforge.in/neet-formula-cards",
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
                    { "@type": "ListItem", "position": 2, "name": "NEET Formula Cards", "item": "https://neetforge.in/neet-formula-cards" }
                ]
            }
        ]
    });

    return (
        <LandingLayout>

            <section className="pt-28 pb-16 bg-gradient-to-br from-[#FFF7ED] via-white to-[#F5F3FF]">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <span className="inline-block bg-orange-50 border border-orange-200 text-orange-500 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        📋 Formula Cards
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        NEET Formula Cards —<br />
                        <span className="text-orange-500">Rapid Review Before Every Test</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        Swipe through Physics equations, Chemistry reactions, and Biology key facts in minutes. NEETFORGE formula cards are built for quick pre-test revision — not lengthy note reading.
                    </p>
                    <a href="https://neetforge.in" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg text-base">
                        Browse Formula Cards <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-4">Subjects & Topics Covered</h2>
                    <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">Formula cards span the entire NEET syllabus across Physics, Chemistry, and Biology.</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {subjects.map((s, i) => (
                            <div key={i} className={`border ${s.color} rounded-2xl p-6`}>
                                <h3 className="font-black text-lg mb-4">{s.name}</h3>
                                <div className="space-y-2">
                                    {s.topics.map((t) => (
                                        <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" />
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-[#F8FAFF]">
                <div className="max-w-4xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">Features of NEETFORGE Formula Cards</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "Swipe-based UX — fast and frictionless",
                            "Physics, Chemistry, Biology fully covered",
                            "Chapter and topic level navigation",
                            "Progress palette — see what's reviewed",
                            "Pre-test rapid refresh mode",
                            "Offline-friendly design",
                            "Key reactions, equations, mnemonics",
                            "Syncs with your weak-area data from AI analysis",
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
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">FAQ — NEET Formula Cards</h2>
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
                    <h2 className="text-3xl font-black text-white mb-4">Swipe. Review. Score Higher.</h2>
                    <p className="text-gray-400 mb-8">10 minutes of formula cards before a test can save you crucial marks.</p>
                    <a href="https://neetforge.in" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-colors text-base">
                        <Zap className="w-5 h-5" /> Access Formula Cards Free
                    </a>
                </div>
            </section>
        </LandingLayout>
    );
}