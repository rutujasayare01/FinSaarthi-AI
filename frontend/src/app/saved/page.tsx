"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  ExternalLink,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Compass,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

export default function SavedSchemesPage() {
  const { language } = useLanguage();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const data = await api.users.getSavedSchemes();
      setSavedItems(data);
    } catch (err) {
      console.error("Failed to load saved schemes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (schemeId: number) => {
    try {
      await api.users.unsaveScheme(schemeId);
      setSavedItems((prev) => prev.filter((item) => item.scheme.id !== schemeId));
    } catch (err) {
      console.error("Failed to remove saved scheme:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-white/10 text-amber-300 backdrop-blur-md">
                <Bookmark className="w-5 h-5 fill-amber-400" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === "mr" ? "जतन केलेल्या योजना" : language === "hi" ? "सहेजी गई योजनाएं" : "Saved Schemes"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-blue-200">
              Track schemes you have bookmarked, review deadlines, and apply on official portals when ready.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shrink-0">
            <div className="text-2xl font-black text-amber-300">{savedItems.length}</div>
            <div className="text-[11px] text-blue-200 font-semibold">Bookmarked Schemes</div>
          </div>
        </div>
      </div>

      {/* Schemes Grid or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading your saved schemes...</p>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            No saved schemes yet
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            When browsing schemes or checking eligibility, tap the bookmark icon on any scheme card to save it here for later.
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Available Schemes</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedItems.map((item) => {
            const s = item.scheme;
            return (
              <div
                key={item.saved_id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {s.category || "General Benefit"}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px]">
                      {s.ministry || "Government of Maharashtra"}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2">
                    {s.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Key Benefit:</span>
                    {s.benefits_summary || "Tuition fee reimbursement and direct maintenance allowance"}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleUnsave(s.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/schemes/${s.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                    >
                      Details
                    </Link>

                    <a
                      href={s.application_url || "https://mahadbt.maharashtra.gov.in"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
