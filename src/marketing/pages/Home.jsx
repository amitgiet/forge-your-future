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

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-inter">
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
      <NeetFooter />
    </div>
  );
}