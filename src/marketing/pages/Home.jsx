import React from "react";
import NeetNavbar from "../components/neetforge/NeetNavbar";
import NeetHero from "../components/neetforge/NeetHero";
import NeetFeatures from "../components/neetforge/NeetFeatures";
import NeetModules from "../components/neetforge/NeetModules";
import NeetStats from "../components/neetforge/NeetStats";
import NeetHowItWorks from "../components/neetforge/NeetHowItWorks";
import NeetTestimonials from "../components/neetforge/NeetTestimonials";
import NeetPricing from "../components/neetforge/NeetPricing";
import NeetScoreGraph from "../components/neetforge/NeetScoreGraph";
import NeetAppDownload from "../components/neetforge/NeetAppDownload";
import NeetCTA from "../components/neetforge/NeetCTA";
import NeetFooter from "../components/neetforge/NeetFooter";
import NeetFAQ, { faqSchema } from "../components/neetforge/NeetFAQ";
import Seo from "../components/Seo";

export default function Home() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "NEETFORGE",
      url: "https://neetforge.com/",
      logo: "https://neetforge.com/favicon.ico",
      description:
        "AI-powered NEET preparation platform for daily practice, mock test analysis, revision planning, and weak-area improvement.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "NEETFORGE",
      url: "https://neetforge.com/",
      description:
        "NEET preparation website focused on practice, analytics, revision, and performance improvement.",
    },
    faqSchema,
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <Seo
        title="NEETFORGE | AI-Powered NEET Preparation, Mock Tests and Revision"
        description="NEETFORGE helps NEET aspirants practice daily, analyze mock tests, revise weak chapters, and improve accuracy with an AI-powered preparation workflow."
        canonicalPath="/"
        schema={schema}
      />
      <NeetNavbar />
      <NeetHero />
      <NeetStats />
      <NeetFeatures />
      <NeetModules />
      <NeetHowItWorks />
      <NeetTestimonials />
      <NeetPricing />
      <NeetScoreGraph />
      <NeetAppDownload />
      <NeetCTA />
      <NeetFAQ />
      <NeetFooter />
    </div>
  );
}
