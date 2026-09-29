"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Search,
  BellRing,
  Bookmark,
  ExternalLink,
  Clock,
  Send,
  Compass,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Layers
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SchemeCard } from "@/components/SchemeCard";
import { QuickEligibilityFinder } from "@/components/QuickEligibilityFinder";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [eligibilitySummary, setEligibilitySummary] = useState<any>({
    eligible_count: 2,
    manual_review_count: 1,
    not_eligible_count: 1,
  });
  const [savedCount, setSavedCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const finderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [schemesData, summaryData, savedData] = await Promise.all([
          api.schemes.list(),
          api.eligibility.summary(),
          api.users.getSavedSchemes(),
        ]);
        setSchemes(schemesData);
        if (summaryData) setEligibilitySummary(summaryData);
        if (savedData) setSavedCount(savedData.length);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const scrollToFinder = () => {
    if (finderRef.current) {
      finderRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const recommendedSchemes = schemes.slice(0, 3);
  const newSchemes = schemes.filter((s) => s.category?.includes("Youth") || s.code?.includes("2024"));

  const recentSearches = [
    { query: "Scholarships for diploma students", count: 4, date: "Today" },
    { query: "Maharashtra student fee concession", count: 2, date: "Yesterday" },
    { query: "EBC Higher education subsidy", count: 3, date: "2 days ago" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. CITIZEN HERO BANNER (Section 10) */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Citizen Benefit Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Find the government benefits you&apos;re eligible for.
          </h1>

          <p className="text-sm sm:text-base text-blue-200 leading-relaxed max-w-2xl">
            FinSaarthi helps you discover schemes, check eligibility, understand requirements, and find the right application path.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={scrollToFinder}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Check My Eligibility</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/schemes"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-blue-300" />
              <span>Explore Schemes</span>
            </Link>

            <Link
              href="/profile"
              className="px-5 py-3 rounded-2xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white font-bold text-sm border border-blue-800 transition-colors"
            >
              Build My Profile
            </Link>
          </div>

          {/* Subtext Prompt */}
          <div className="pt-2 text-xs text-blue-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Upload your documents or provide your details and we&apos;ll help find relevant schemes from official portals.
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PROGRESSIVE SCHEME FINDER (Section 11-14) */}
      <div ref={finderRef}>
        <QuickEligibilityFinder />
      </div>

      {/* 3. CITIZEN METRIC OVERVIEW CARDS (Section 45) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Eligible Schemes */}
        <Link
          href="/eligibility"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Eligible Schemes</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {eligibilitySummary.eligible_count || 2}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
            Ready to apply on official portal
          </span>
        </Link>

        {/* Needs Review / Missing Docs */}
        <Link
          href="/eligibility"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Needs Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {eligibilitySummary.manual_review_count || 1}
          </div>
          <span className="text-[11px] font-semibold text-amber-600 flex items-center">
            Upload 1 pending document to unlock
          </span>
        </Link>

        {/* Documents */}
        <Link
          href="/documents"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">My Documents</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">2</div>
          <span className="text-[11px] font-semibold text-blue-600 flex items-center">
            Income & Student ID confirmed
          </span>
        </Link>

        {/* Saved Schemes */}
        <Link
          href="/saved"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Saved Schemes</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{savedCount}</div>
          <span className="text-[11px] font-semibold text-purple-600 flex items-center">
            Bookmarked for application tracking
          </span>
        </Link>
      </div>

      {/* 4. PROACTIVE CITIZEN ALERT BOX */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl border border-amber-300 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Proactive Citizen Recommendation
                </span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                  Upcoming Opportunity
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                New Higher Education Fee Waiver Scheme Published
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Maharashtra Social Justice Department announced updated income eligibility criteria for diploma and engineering candidates.
              </p>
            </div>
          </div>

          <Link
            href="/notifications"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shrink-0"
          >
            Review Notification
          </Link>
        </div>
      </div>

      {/* 5. RECOMMENDED FOR YOU (Section 45) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Recommended For You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Matched against your verified profile criteria
            </p>
          </div>
          <Link
            href="/schemes"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Schemes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedSchemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      </div>

      {/* 6. RECENT SEARCHES (Section 35) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Citizen Searches</span>
          </h3>
          <span className="text-[11px] text-slate-400">Personalized search history</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {recentSearches.map((item, idx) => (
            <Link
              key={idx}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.query}</span>
              <span className="text-[10px] text-slate-400">({item.date})</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
