import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { Target, Zap, Brain, ArrowRight } from "lucide-react";
import useSEO from "../hooks/useSEO";

const values = [
    { icon: Target, title: "Performance-First", desc: "Every feature is built around one question: does this improve your NEET score? We don't add features for the sake of it." },
    { icon: Brain, title: "Data-Driven Learning", desc: "Gut feel is not a study strategy. We give you the data to know exactly what to work on next, every single day." },
    { icon: Zap, title: "Built for Mobile", desc: "NEET prep happens in buses, hostels, between coaching classes. We design every screen for fast, frictionless mobile use." },
];

export default function About() {
    useSEO({
        title: "About NEETFORGE — Our Mission & Story",
        description: "NEETFORGE was built to give every NEET aspirant access to the performance intelligence that only toppers had. Learn about our mission, values, and what drives us.",
        keywords: "about NEETFORGE, NEET preparation app, NEET app mission, NEETFORGE story, best NEET app India",
        canonical: "https://neetforge.in/about",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://neetforge.in/" },
                { "@type": "ListItem", "position": 2, "name": "About", "item": "https://neetforge.in/about" }
            ]
        }
    });

    return (
        <LandingLayout>
            <div className="pt-28 pb-20">
                {/* Hero */}
                <section className="max-w-4xl mx-auto px-5 text-center mb-20">
                    <span className="inline-block bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-5">
                        Built by People Who Understand<br />
                        <span className="text-[#2563EB]">What NEET Prep Actually Needs</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                        NEETFORGE was built after observing a simple problem: most NEET aspirants practice a lot but improve slowly — because they don't know *what* to fix. We built the tools that close that gap.
                    </p>
                </section>

                {/* Mission */}
                <section className="bg-[#0f172a] py-16 mb-20">
                    <div className="max-w-4xl mx-auto px-5 text-center">
                        <h2 className="text-3xl font-black text-white mb-4">Our Mission</h2>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                            To give every NEET aspirant — regardless of coaching quality or geography — access to performance intelligence that was previously only available to toppers with private tutors.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className="max-w-5xl mx-auto px-5 mb-20">
                    <h2 className="text-3xl font-black text-[#0f172a] text-center mb-10">What We Stand For</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {values.map((v, i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                                    <v.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-[#0f172a] text-lg mb-2">{v.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-2xl mx-auto px-5 text-center">
                    <h2 className="text-3xl font-black text-[#0f172a] mb-4">Ready to Try It?</h2>
                    <p className="text-gray-500 mb-8">See for yourself why thousands of NEET aspirants practice on NEETFORGE every day.</p>
                    <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg text-base">
                        Start Free <ArrowRight className="w-5 h-5" />
                    </a>
                </section>
            </div>
        </LandingLayout>
    );
}