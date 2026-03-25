import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";
import { faqSchema, faqs } from "../components/neetforge/NeetFAQ";
import Seo from "../components/Seo";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <LandingLayout>
      <Seo
        title="NEETFORGE FAQ — All Your NEET Prep Questions Answered"
        description="Everything you need to know about NEETFORGE — how it works, what's free, how AI analysis helps, and why thousands of NEET aspirants choose it for daily practice and revision."
        canonicalPath="/faq"
        schema={{
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
        }}
      />
      <div className="pt-28 pb-20 max-w-4xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wider">
            FAQ
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Everything you want to know about NEETFORGE — from how it works to what makes it different.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-0 shadow-sm transition-all duration-300 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/40"
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

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-5">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg text-base"
          >
            Contact Us →
          </a>
        </div>
      </div>
    </LandingLayout>
  );
}
