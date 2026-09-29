"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  Bookmark,
  FileText,
  Sparkles,
  Info
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { api } from "@/lib/api";

export default function MyBenefitsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [filterTab, setFilterTab] = useState<"ALL" | "ELIGIBLE" | "MANUAL_REVIEW" | "NOT_ELIGIBLE" | "SAVED">("ALL");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const [evalData, savedData] = await Promise.all([
        api.eligibility.batch(),
        api.users.getSavedSchemes(),
      ]);
      setBatchResults(evalData.results || []);
      setSavedSchemes(savedData || []);
      setSavedIds((savedData || []).map((s: any) => s.scheme.id));
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [user]);

  const handleBookmarkToggle = async (schemeId: number) => {
    try {
      if (savedIds.includes(schemeId)) {
        await api.users.unsaveScheme(schemeId);
        setSavedIds((prev) => prev.filter((id) => id !== schemeId));
      } else {
        await api.users.saveScheme(schemeId);
        setSavedIds((prev) => [...prev, schemeId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const eligibleItems = batchResults.filter((r) => r.status === "ELIGIBLE");
  const manualItems = batchResults.filter((r) => r.status === "MANUAL_REVIEW");
  const notEligibleItems = batchResults.filter((r) => r.status === "NOT_ELIGIBLE");

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-white/10 text-emerald-300 backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === "mr" ? "माझे शासकीय लाभ" : language === "hi" ? "मेरे सरकारी लाभ" : "My Benefits"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-blue-200">
              Clear, transparent eligibility evaluations matching your verified profile attributes.
            </p>
          </div>

          <button
            onClick={runEvaluation}
            disabled={evaluating}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all shadow-md self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? "animate-spin" : ""}`} />
            <span>{evaluating ? "Evaluating Rules..." : "Re-check Eligibility"}</span>
          </button>
        </div>
      </div>

      {/* Evaluated Citizen Profile Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{user?.full_name || "Demo Citizen"}</span>
            <span className="text-[11px] text-slate-500">
              Active Parameters: Maharashtra • Age 21 • Student • Annual Income ₹2,40,000 • OBC
            </span>
          </div>
        </div>

        <Link
          href="/profile"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          Edit Profile Criteria ➔
        </Link>
      </div>

      {/* Status Filter Tabs (Section 29) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterTab === "ALL" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Schemes ({batchResults.length})
        </button>
        <button
          onClick={() => setFilterTab("ELIGIBLE")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            filterTab === "ELIGIBLE"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Eligible ({eligibleItems.length})</span>
        </button>
        <button
          onClick={() => setFilterTab("MANUAL_REVIEW")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            filterTab === "MANUAL_REVIEW"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Needs Review ({manualItems.length})</span>
        </button>
        <button
          onClick={() => setFilterTab("NOT_ELIGIBLE")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            filterTab === "NOT_ELIGIBLE"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Not Eligible ({notEligibleItems.length})</span>
        </button>
        <button
          onClick={() => setFilterTab("SAVED")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            filterTab === "SAVED"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({savedSchemes.length})</span>
        </button>
      </div>

      {/* Schemes Results List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Checking eligibility against official rules...</p>
        </div>
      ) : filterTab === "SAVED" ? (
        /* SAVED SCHEMES TAB */
        savedSchemes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No saved schemes yet.</p>
            <p className="text-xs text-slate-500 mt-1">Tap the bookmark icon on any scheme to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSchemes.map((s) => (
              <div key={s.saved_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {s.scheme.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{s.scheme.ministry}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{s.scheme.title}</h3>
                  <p className="text-xs text-slate-600 mb-4">{s.scheme.benefits_summary}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button onClick={() => handleBookmarkToggle(s.scheme.id)} className="text-xs text-rose-600 font-bold hover:underline">
                    Remove from Saved
                  </button>
                  <a
                    href={s.scheme.application_url || "https://mahadbt.maharashtra.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                  >
                    <span>Apply on Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ELIGIBILITY EVALUATION CARDS */
        <div className="space-y-4">
          {(filterTab === "ALL"
            ? batchResults
            : filterTab === "ELIGIBLE"
            ? eligibleItems
            : filterTab === "MANUAL_REVIEW"
            ? manualItems
            : notEligibleItems
          ).map((item, idx) => {
            const isBookmarked = savedIds.includes(item.scheme_id);
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {item.ministry || item.category || "Government of Maharashtra"}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {item.scheme_title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => handleBookmarkToggle(item.scheme_id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        isBookmarked
                          ? "bg-amber-50 text-amber-600 border-amber-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                      title="Save scheme"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                    <EligibilityBadge status={item.status} size="md" />
                  </div>
                </div>

                {/* Key Benefit Highlight */}
                {item.benefits_summary && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                      Estimated Citizen Benefit:
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {item.benefits_summary}
                    </span>
                  </div>
                )}

                {/* Rule Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  {/* Passed Criteria */}
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Why You Qualify ({item.passed_rules?.length || 0}):</span>
                    </span>
                    <div className="space-y-1">
                      {item.passed_rules?.map((r: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-950 text-xs font-medium">
                          <strong>{r.field}:</strong> {r.reason || `Matches requirement (${r.actual_value})`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failed / Missing Criteria */}
                  <div className="space-y-1.5">
                    {item.failed_rules?.length > 0 && (
                      <>
                        <span className="font-extrabold text-rose-800 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Unmet Condition ({item.failed_rules?.length}):</span>
                        </span>
                        <div className="space-y-1">
                          {item.failed_rules?.map((r: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-xl bg-rose-50 text-rose-950 text-xs font-medium">
                              <strong>{r.field}:</strong> {r.reason || `Did not meet criteria`}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {item.missing_documents?.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1.5 mt-2">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Pending Document to Unlock:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.missing_documents.map((d: string, i: number) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-white text-amber-950 font-bold border border-amber-300 text-xs"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        <Link
                          href="/documents"
                          className="inline-flex items-center space-x-1.5 text-blue-700 hover:underline pt-2 font-bold text-xs"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload document in My Documents</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/schemes/${item.scheme_id}`}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1"
                  >
                    <span>View Scheme Guidelines</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={item.application_url || "https://mahadbt.maharashtra.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
