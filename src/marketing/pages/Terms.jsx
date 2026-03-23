import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";

export default function Terms() {
    return (
        <LandingLayout>
            <title>Terms of Service | NEETFORGE</title>
            <div className="max-w-3xl mx-auto px-5 py-28">
                <h1 className="text-4xl font-black text-[#0f172a] mb-3">Terms of Service</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: March 2025</p>

                {[
                    {
                        title: "1. Acceptance of Terms",
                        body: "By accessing or using NEETFORGE, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
                    },
                    {
                        title: "2. Use of the Platform",
                        body: "NEETFORGE is an educational tool for NEET examination preparation. You may use it for personal, non-commercial purposes only. You agree not to misuse the platform, reverse-engineer it, or use automated bots.",
                    },
                    {
                        title: "3. Account Responsibility",
                        body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
                    },
                    {
                        title: "4. Content",
                        body: "All question bank content, explanations, and materials on NEETFORGE are the property of NEETFORGE and its licensors. You may not reproduce, distribute, or create derivative works without written permission.",
                    },
                    {
                        title: "5. Subscription & Payments",
                        body: "Pro plan subscriptions are billed monthly at ₹299/month. You may cancel at any time. Refunds are not provided for partial billing periods. Payment is processed securely by our payment partner.",
                    },
                    {
                        title: "6. Limitation of Liability",
                        body: "NEETFORGE is provided 'as is'. We make no guarantees about exam outcomes. We are not liable for any direct or indirect damages arising from use of the platform.",
                    },
                    {
                        title: "7. Termination",
                        body: "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
                    },
                    {
                        title: "8. Governing Law",
                        body: "These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in India.",
                    },
                    {
                        title: "9. Contact",
                        body: "For questions about these Terms, contact us at support@neetforge.in.",
                    },
                ].map((section, i) => (
                    <div key={i} className="mb-8">
                        <h2 className="text-xl font-black text-[#0f172a] mb-3">{section.title}</h2>
                        <p className="text-gray-600 leading-relaxed">{section.body}</p>
                    </div>
                ))}
            </div>
        </LandingLayout>
    );
}