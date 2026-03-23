
import React from "react";
import LandingLayout from "../components/neetforge/LandingLayout";

export default function PrivacyPolicy() {
    return (
        <LandingLayout>
            <title>Privacy Policy | NEETFORGE</title>
            <div className="max-w-3xl mx-auto px-5 py-28">
                <h1 className="text-4xl font-black text-[#0f172a] mb-3">Privacy Policy</h1>
                <p className="text-gray-500 text-sm mb-10">Last updated: March 2025</p>

                {[
                    {
                        title: "1. Information We Collect",
                        body: "We collect information you provide directly (name, email, usage data) when you create an account or use the NEETFORGE platform. We also collect performance data such as questions attempted, accuracy, and session time to power our AI analysis features.",
                    },
                    {
                        title: "2. How We Use Your Information",
                        body: "We use your data to provide and improve the NEETFORGE service, generate AI-powered analysis and recommendations, send you progress updates, and maintain your account. We do not sell your personal data to third parties.",
                    },
                    {
                        title: "3. Data Storage & Security",
                        body: "Your data is stored securely on encrypted servers. We use industry-standard security practices to protect your information from unauthorized access.",
                    },
                    {
                        title: "4. Cookies",
                        body: "We use cookies to maintain your login session and track in-app usage for analytics. You can disable cookies in your browser settings, but some features may not work correctly.",
                    },
                    {
                        title: "5. Third-Party Services",
                        body: "NEETFORGE uses third-party services such as analytics providers and payment processors. These services have their own privacy policies and may process your data as described in their policies.",
                    },
                    {
                        title: "6. Children's Privacy",
                        body: "NEETFORGE is designed for students aged 16 and above. We do not knowingly collect personal data from children under 13. If you believe we have collected data from a child under 13, please contact us immediately.",
                    },
                    {
                        title: "7. Your Rights",
                        body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at support@neetforge.in.",
                    },
                    {
                        title: "8. Changes to This Policy",
                        body: "We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification.",
                    },
                    {
                        title: "9. Contact",
                        body: "If you have questions about this Privacy Policy, contact us at support@neetforge.in.",
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