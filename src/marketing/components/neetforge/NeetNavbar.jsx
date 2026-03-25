import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Modules", href: "/#modules" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export default function NeetNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-[#2563EB] font-black text-2xl tracking-tight">NEET<span className="text-[#1a1a2e]">FORGE</span></span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
            className="text-sm font-semibold text-[#2563EB] hover:underline">
            Sign In
          </a>
          <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
            className="bg-[#2563EB] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Get Started Free
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-5 py-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1.5">{l.label}</a>
          ))}
          <a href="https://neetforge.in/app" target="_blank" rel="noreferrer"
            className="block w-full text-center bg-[#2563EB] text-white font-semibold py-3 rounded-xl mt-2">
            Get Started Free
          </a>
        </div>
      )}
    </nav>
  );
}