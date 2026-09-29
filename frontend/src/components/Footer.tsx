"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Sparkles, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { language } = useLanguage();

  const officialLinks = [
    { name: "myScheme Portal", url: "https://www.myscheme.gov.in/" },
    { name: "National Portal of India", url: "https://www.india.gov.in/" },
    { name: "MahaDBT (Maharashtra)", url: "https://mahadbt.maharashtra.gov.in/" },
    { name: "National Scholarship Portal", url: "https://scholarships.gov.in/" },
    { name: "MSME Udyam Registration", url: "https://udyamregistration.gov.in/" },
    { name: "PM-KISAN Samman Nidhi", url: "https://pmkisan.gov.in/" },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-16 transition-colors">
      {/* Trust & Transparency Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              {language === "mr"
                ? "अधिकृत सरकारी पोर्टलवरून पडताळलेली माहिती • नागरिक डेटा सुरक्षित"
                : language === "hi"
                ? "आधिकारिक सरकारी पोर्टलों से सत्यापित जानकारी • नागरिक डेटा सुरक्षित"
                : "Information sourced from official government portals • Citizen data privacy protected"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {language === "mr"
              ? "पात्रता माहिती सल्लागार स्वरूपाची आहे; अंतिम निर्णय संबंधित विभागाचा असेल."
              : language === "hi"
              ? "पात्रता परिणाम केवल मार्गदर्शन के लिए हैं; अंतिम निर्णय संबंधित विभाग का होता है।"
              : "Eligibility results are informational; final verification is conducted by the issuing authority."}
          </span>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gov-saffron via-white to-gov-green flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-gov-navy rounded-[6px] flex items-center justify-center">
                  <span className="text-gov-saffron font-black text-xs">FS</span>
                </div>
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">FinSaarthi AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === "mr"
                ? "सर्वसामान्य नागरिकांसाठी शासकीय योजना शोधणे, पात्रता समजणे आणि थेट अर्ज करणे सुलभ करणारे आधुनिक व्यासपीठ."
                : language === "hi"
                ? "आम नागरिकों के लिए सरकारी योजनाओं को खोजना, पात्रता समझना और आवेदन करना आसान बनाने वाला मंच।"
                : "Making government schemes easier to discover, verify eligibility, and apply with confidence for every citizen."}
            </p>
            <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500">
              <span>Multilingual Support:</span>
              <span className="text-slate-300 font-semibold">English • मराठी • हिन्दी</span>
            </div>
          </div>

          {/* Citizen Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {language === "mr" ? "मुख्य पान (Home)" : language === "hi" ? "होम (Home)" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-white transition-colors">
                  {language === "mr" ? "योजना शोधा (Discover Schemes)" : language === "hi" ? "योजनाएं खोजें (Discover Schemes)" : "Discover Schemes"}
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-white transition-colors">
                  {language === "mr" ? "माझे लाभ (My Benefits)" : language === "hi" ? "मेरे लाभ (My Benefits)" : "My Benefits"}
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white transition-colors">
                  {language === "mr" ? "माझी कागदपत्रे (My Documents)" : language === "hi" ? "मेरे दस्तावेज (My Documents)" : "My Documents"}
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-white transition-colors">
                  {language === "mr" ? "जतन केलेल्या योजना (Saved Schemes)" : language === "hi" ? "सहेजी गई योजनाएं (Saved Schemes)" : "Saved Schemes"}
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-white transition-colors flex items-center gap-1 text-purple-300 font-medium">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>FinSaarthi AI</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Government Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              {officialLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center space-x-1.5"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidance & Help */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Guidance & Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  How Eligibility Works
                </Link>
              </li>
              <li>
                <Link href="/help#documents" className="hover:text-white transition-colors">
                  Document Extraction Guidance
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Government Resources Registry
                </Link>
              </li>
              <li>
                <Link href="/help#privacy" className="hover:text-white transition-colors">
                  Citizen Privacy & Security
                </Link>
              </li>
              <li>
                <Link href="/help#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 FinSaarthi AI. All rights reserved. Sourced from official central & state repositories.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/help#privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-slate-300">Terms of Use</Link>
            <span>•</span>
            <Link href="/resources" className="hover:text-slate-300">Official Portals</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
