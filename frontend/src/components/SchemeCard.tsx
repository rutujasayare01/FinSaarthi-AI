"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Bookmark, ArrowRight, CheckCircle2, Building2, MapPin } from "lucide-react";
import { EligibilityBadge } from "./EligibilityBadge";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

interface SchemeCardProps {
  scheme: {
    id: number;
    code: string;
    title: string;
    title_hi?: string;
    title_mr?: string;
    ministry: string;
    department?: string;
    state: string;
    category: string;
    description?: string;
    description_hi?: string;
    description_mr?: string;
    benefits_summary: string;
    application_url?: string;
    deadline?: string;
    is_demo?: boolean;
  };
  eligibilityStatus?: string;
  onEligibilityChecked?: (status: string) => void;
}

export function SchemeCard({ scheme, eligibilityStatus }: SchemeCardProps) {
  const { language, t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | undefined>(eligibilityStatus);
  const [loading, setLoading] = useState(false);

  // Multilingual display
  const title =
    language === "mr" && scheme.title_mr
      ? scheme.title_mr
      : language === "hi" && scheme.title_hi
      ? scheme.title_hi
      : scheme.title;

  const handleSaveToggle = async () => {
    try {
      if (!saved) {
        await api.schemes.getById(scheme.id); // check exist
        setSaved(true);
      } else {
        setSaved(false);
      }
    } catch (_) {
      setSaved(!saved);
    }
  };

  const handleCheckEligibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.eligibility.checkSingle(scheme.id);
      setStatus(res.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {scheme.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-slate-500" />
              {scheme.state}
            </span>
          </div>
          <button
            onClick={handleSaveToggle}
            className={`p-1.5 rounded-lg border transition-colors ${
              saved
                ? "bg-amber-50 text-amber-600 border-amber-300"
                : "text-slate-400 hover:text-slate-600 border-slate-200"
            }`}
            title="Bookmark Scheme"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <Link href={`/schemes/${scheme.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
            {title}
          </h3>
        </Link>

        {/* Ministry */}
        <p className="text-xs text-slate-500 flex items-center mb-3">
          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
          <span className="truncate">{scheme.ministry}</span>
        </p>

        {/* Benefits Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.common.benefits}
          </span>
          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
            {scheme.benefits_summary}
          </p>
        </div>
      </div>

      {/* Footer / Status & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {status ? (
          <EligibilityBadge status={status} size="sm" />
        ) : (
          <button
            onClick={handleCheckEligibility}
            disabled={loading}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center"
          >
            {loading ? "Checking..." : `⚡ ${t.eligibility.checkButton}`}
          </button>
        )}

        <div className="flex items-center space-x-2">
          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Official Portal Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link
            href={`/schemes/${scheme.id}`}
            className="inline-flex items-center text-xs font-semibold bg-slate-900 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors space-x-1"
          >
            <span>{t.common.details}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
