import React from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    question: "What is NEETFORGE?",
    answer:
      "NEETFORGE is an AI-powered NEET preparation platform that combines daily practice, mock test analysis, revision tracking, and targeted weak-area improvement in one place.",
  },
  {
    question: "How does NEETFORGE help improve NEET scores?",
    answer:
      "It closes the loop between practice, analysis, revision, and reattempts. Instead of only solving questions, students can identify weak chapters, revise at the right time, and train with structured NEET-style practice.",
  },
  {
    question: "Does NEETFORGE support NEET mock tests and daily practice?",
    answer:
      "Yes. The platform is designed around NEET-style practice, daily DPP sessions, mock tests, analytics, revision tools, and AI-guided follow-up based on performance.",
  },
  {
    question: "Is NEETFORGE useful for weak chapters and revision?",
    answer:
      "Yes. NEETFORGE is built to surface weak areas, organize revision, and help students repeatedly revisit topics until they become retention-friendly and exam ready.",
  },
  {
    question: "Who should use NEETFORGE?",
    answer:
      "It is useful for NEET aspirants who want a more structured preparation system, including droppers, class 11 students, class 12 students, and learners who want better feedback after practice.",
  },
  {
    question: "Is NEETFORGE free to use?",
    answer:
      "Yes. NEETFORGE has a free tier that gives you access to daily practice questions, formula cards, and basic analytics. Premium features like full mock test analysis, personalized revision plans, and AI insights are available with a Pro plan.",
  },
  {
    question: "Does NEETFORGE cover NEET Biology, Chemistry, and Physics?",
    answer:
      "Yes. NEETFORGE covers all three NEET subjects — Biology (Botany + Zoology), Chemistry (Physical, Organic, Inorganic), and Physics — with chapter-wise questions, PYQs, formula cards, and revision tools for each subject.",
  },
  {
    question: "How can I practice PYQ (Previous Year Questions) on NEETFORGE?",
    answer:
      "NEETFORGE includes a dedicated PYQ practice mode that lets you filter questions by subject, chapter, year, and exam type (NEET/AIPMT). You can attempt them in timed or untimed mode and see AI-generated explanations after each question.",
  },
  {
    question: "What is the AI analysis feature on NEETFORGE?",
    answer:
      "NEETFORGE's AI analysis reviews your mock test performance and pinpoints which chapters and question types are hurting your score. It generates a prioritized list of weak areas and recommends specific revision tasks — saving you hours of manual review.",
  },
  {
    question: "How does the revision system work?",
    answer:
      "NEETFORGE uses a spaced-repetition system. After you attempt questions, it tracks which concepts you struggled with and schedules them for automatic revision at the optimal time — so you never forget a topic close to the exam.",
  },
  {
    question: "Can I use NEETFORGE on Android?",
    answer:
      "Yes. NEETFORGE is available as an Android app. You can also access the full platform on any browser via the web app at neetforge.in/app, with no installation needed.",
  },
  {
    question: "How is NEETFORGE different from other NEET apps?",
    answer:
      "Most NEET apps focus only on content delivery. NEETFORGE focuses on performance improvement — it tells you what to fix, when to revise it, and tracks your accuracy over time so that every study session is targeted and efficient.",
  },
];

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function NeetFAQ() {
  return (
    <section id="faq" className="py-24 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_40%,#eef5ff_100%)]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#2563EB] shadow-sm">
              FAQ
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl md:leading-[1.05]">
              Questions Students Ask Before Choosing a NEET Prep Platform
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
              We kept this section expandable so the page feels cleaner, but the full FAQ content still
              stays crawlable for search engines. It helps explain how NEETFORGE supports NEET mock
              tests, revision, weak-area analysis, and daily practice.
            </p>

            {/* <div className="mt-8 rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_-30px_rgba(37,99,235,0.35)] backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-lg text-white shadow-lg shadow-blue-200">
                  ?
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Built for clarity</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Instead of stuffing the section with heavy cards, each answer opens only when needed,
                    which keeps the homepage lighter and easier to scan.
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-3 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.22),0_10px_20px_-14px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${index}`}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-0 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.28),0_3px_8px_-4px_rgba(15,23,42,0.12)] transition-all duration-300 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/40 data-[state=open]:shadow-[0_24px_44px_-28px_rgba(37,99,235,0.28),0_10px_18px_-10px_rgba(37,99,235,0.14)]"
                >
                  <AccordionTrigger className="group px-6 py-5 text-left text-base font-bold text-slate-900 hover:no-underline [&>svg]:hidden">
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="leading-snug">{faq.question}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all group-data-[state=open]:rotate-180 group-data-[state=open]:border-blue-200 group-data-[state=open]:bg-white group-data-[state=open]:text-[#2563EB]">
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0 text-[15px] leading-7 text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
