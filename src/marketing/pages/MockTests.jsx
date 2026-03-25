
import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { ArrowRight, Clock, FileText, BarChart2, Target, CheckCircle, Zap } from "lucide-react";
import useSEO from "../hooks/useSEO";

const faqs = [
    { q: "Are the mock tests NTA-pattern?", a: "Yes. Every NEETFORGE mock test follows the official NTA pattern — 180 MCQs, Physics/Chemistry/Biology split, -1 negative marking, and a 200-minute timer." },
    { q: "How many mock tests are available?", a: "There are 29+ full-length mock tests plus chapter-wise part tests across Physics, Chemistry, and Biology." },
    { q: "Can I review solutions after the test?", a: "Absolutely. After every test you get a full solution breakdown with subject-wise analysis and weak-chapter detection." },
    { q: "Are mock tests free?", a: "The first few tests are free. Full access to all tests is available on the Pro plan (₹299/month)." },
];

export default function MockTests() {
    useSEO({
        title: "NEET Mock Tests 2025 — NTA Pattern Full Length Tests | NEETFORGE",
        description: "Practice with 29+ NTA-pattern NEET mock tests. Full-length 180 MCQs, 200-minute timer, negative marking, and AI-powered chapter-wise analysis after every test. Free to start.",
        keywords: "NEET mock test 2025, NTA pattern mock test, NEET full length test, NEET practice test, free NEET mock test, NEET 2025 test series",
        canonical: "https://neetforge.in/neet-mock-tests",
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
                    { "@type": "ListItem", "position": 2, "name": "NEET Mock Tests", "item": "https://neetforge.in/neet-mock-tests" }
                ]
            }
        ]
    });

    return (
        <LandingLayout>

            {/* Hero */}
            <section className="pt-28 pb-16 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4]">
                <div className="max-w-4xl mx-auto px-5 text-center">
                    <span className="inline-block bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        NTA-Pattern Mock Tests
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        NEET Mock Tests 2025<br />
                        <span className="text-[#2563EB]">Full Length. Real Pattern. Deep Analysis.</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        Practice with NTA-style full-length mock tests. After every test, NEETFORGE shows you exactly which chapters cost you marks — so you fix the right things.
                    </p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg text-base">
                        Start a Free Mock Test <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* Why mock tests matter */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">Why Regular Mock Tests Improve Your NEET Score</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, title: "Time Management", desc: "Regular timed practice trains you to pace 180 questions in 200 minutes — a skill that can't be built from theory alone.", color: "bg-blue-50 text-blue-600" },
                            { icon: BarChart2, title: "Identify Weak Chapters", desc: "Post-test AI analysis pinpoints which Biology chapters, Physics topics, or Chemistry units are dragging your score down.", color: "bg-indigo-50 text-indigo-600" },
                            { icon: Target, title: "Exam Day Confidence", desc: "Repeated NTA-interface exposure reduces exam-day anxiety and decision fatigue during the actual NEET exam.", color: "bg-green-50 text-green-600" },
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

            {/* Features list */}
            <section className="py-16 bg-[#F8FAFF]">
                <div className="max-w-4xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">What's Inside NEETFORGE Mock Tests</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "180 MCQs — Physics, Chemistry, Biology",
                            "200-minute countdown timer",
                            "NTA-style interface (familiar = less anxiety)",
                            "Negative marking (-1 for wrong answers)",
                            "Chapter-wise accuracy breakdown after test",
                            "AI weak-area detection post-analysis",
                            "Compare performance with other aspirants",
                            "Full solution review with explanations",
                            "29+ full-length tests + chapter part-tests",
                            "Free access to initial tests — no signup barrier",
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <CheckCircle className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">Frequently Asked Questions</h2>
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

            {/* CTA */}
            <section className="py-14 bg-[#0f172a] text-center">
                <div className="max-w-2xl mx-auto px-5">
                    <h2 className="text-3xl font-black text-white mb-4">Ready to Test Yourself?</h2>
                    <p className="text-gray-400 mb-8">Take your first free NEET mock test today and see exactly where you stand.</p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors text-base">
                        <Zap className="w-5 h-5" /> Take Free Mock Test
                    </a>
                </div>
            </section>
        </LandingLayout>
    );
}