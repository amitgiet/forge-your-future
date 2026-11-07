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
import NeetFAQ from "../components/neetforge/NeetFAQ";
import Seo from "../components/Seo";

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://neetforge.in/#organization",
      "name": "NEETFORGE",
      "url": "https://neetforge.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://neetforge.in/apple-touch-icon.png",
        "width": 180,
        "height": 180
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@neetforge.in",
        "contactType": "customer support"
      },
      "sameAs": [
        "https://twitter.com/neetforge",
        "https://youtube.com/@neetforge",
        "https://t.me/neetforge"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://neetforge.in/#website",
      "name": "NEETFORGE",
      "url": "https://neetforge.in",
      "publisher": {
        "@id": "https://neetforge.in/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://neetforge.in/#app",
      "name": "NEETFORGE",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Android, iOS, Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    }
  ]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <Seo
        title="NEETFORGE — AI-Powered NEET Preparation App 2025"
        description="NEETFORGE is India's smartest NEET preparation app. Daily DPP, NTA-style mock tests, AI weak-area detection, spaced repetition revision (NeuronZ), and formula cards. Free to start."
        canonicalPath="/"
        schema={homeSchema}
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
