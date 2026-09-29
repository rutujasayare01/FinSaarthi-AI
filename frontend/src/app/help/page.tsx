"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  ExternalLink,
  MessageCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface FAQItem {
  question: string;
  answer: string;
  category: "ELIGIBILITY" | "DOCUMENTS" | "APPLICATION" | "PRIVACY";
}

const FAQS: FAQItem[] = [
  {
    category: "ELIGIBILITY",
    question: "How does FinSaarthi AI determine my eligibility for government schemes?",
    answer: "FinSaarthi AI evaluates your verified profile attributes (age, state, annual family income, student/farmer status, and category) against authoritative eligibility conditions published in official government gazettes. We use deterministic rules—meaning the system never guesses or assumes. If a required parameter is missing, FinSaarthi clearly prompts you to provide it.",
  },
  {
    category: "DOCUMENTS",
    question: "How does Document Information Extraction work?",
    answer: "When you upload an Income Certificate, Domicile, or Student ID in PDF or image format, FinSaarthi reads the text and extracts key values like annual income, certificate numbers, and issuance dates. Crucially, extracted values are presented to you for confirmation first. We never silently save extracted data without your verification.",
  },
  {
    category: "APPLICATION",
    question: "Do I apply for schemes directly on FinSaarthi or on official government portals?",
    answer: "FinSaarthi guides you through discovery and eligibility verification, and directs you directly to the official government portal (such as MahaDBT, NSP, or PM-KISAN) for final submission. This guarantees your application is processed directly by the government department without unverified middlemen.",
  },
  {
    category: "PRIVACY",
    question: "Is my personal data and document storage secure?",
    answer: "Yes. All citizen profiles and uploaded documents are encrypted and securely stored. FinSaarthi does not share your data with advertisers, third-party loan brokers, or commercial entities. Your information is used exclusively to evaluate your eligibility for welfare programs.",
  },
  {
    category: "DOCUMENTS",
    question: "What is the validity period of an Income Certificate in Maharashtra?",
    answer: "In Maharashtra, an Income Certificate issued by the Tahsildar (under Aaple Sarkar) is typically valid for 1 year (or 3 years if issued as a 3-year certificate). FinSaarthi alerts you 30 days before your document expires so you can renew it ahead of scholarship deadlines.",
  },
  {
    category: "ELIGIBILITY",
    question: "Can I be eligible for multiple schemes simultaneously?",
    answer: "Yes, provided the schemes do not conflict. For example, a student can receive the Rajarshi Shahu Maharaj Tuition Fee Waiver and simultaneously participate in the Mukhyamantri Yuva Karya Prashikshan Yojana internship program.",
  },
];

export default function HelpGuidancePage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredFaqs = FAQS.filter(
    (f) => activeCategory === "ALL" || f.category === activeCategory
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-amber-300">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Citizen Support & Knowledge Base
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === "mr" ? "मदत आणि मार्गदर्शन केंद्र" : language === "hi" ? "सहायता एवं मार्गदर्शन केंद्र" : "Help & Guidance Center"}
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-blue-200 max-w-2xl mt-2 leading-relaxed">
          Learn how FinSaarthi AI evaluates benefits, extracts document details, protects your privacy, and guides you to official application portals.
        </p>
      </div>

      {/* 3 Step Process Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-sm mb-3">
            1
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            Build Your Profile
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Provide your basic details manually, via voice in your mother tongue, or by uploading an income certificate. FinSaarthi stores your profile safely.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-sm mb-3">
            2
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            Deterministic Eligibility
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our system compares your attributes with official government rules. You get a transparent breakdown of why you qualify and what documents to bring.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm mb-3">
            3
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            Apply on Official Portals
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click directly through to MahaDBT, NSP, or myScheme. No middlemen, no unverified agents, and zero application fees charged by FinSaarthi.
          </p>
        </div>
      </div>

      {/* Privacy & Trust Statement Section */}
      <div id="privacy" className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-base">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Citizen Privacy & Data Protection Commitment</span>
            </div>
            <p className="text-xs text-emerald-800 max-w-2xl leading-relaxed">
              FinSaarthi adheres to stringent digital data protection guidelines. We do not sell your data, we do not monetize your document uploads, and you can edit or delete your stored records at any time from your Profile.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            Manage My Stored Data
          </Link>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers to common questions about welfare schemes, documentation, and verification.
            </p>
          </div>

          {/* Filter Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {["ALL", "ELIGIBILITY", "DOCUMENTS", "APPLICATION", "PRIVACY"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
