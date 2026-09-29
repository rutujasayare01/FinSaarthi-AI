"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UploadCloud,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { api } from "@/lib/api";

export default function SchemeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [scheme, setScheme] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    async function loadScheme() {
      if (!id) return;
      try {
        const [schemeData, evalData] = await Promise.all([
          api.schemes.getById(id as string),
          api.eligibility.checkSingle(id as string).catch(() => null),
        ]);
        setScheme(schemeData);
        setEvaluation(evalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScheme();
  }, [id]);

  const handleReEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await api.eligibility.checkSingle(id as string);
      setEvaluation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading scheme verification details...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-bold text-slate-700">Scheme not found.</p>
        <Link href="/schemes" className="text-xs text-blue-600 font-semibold underline mt-2 block">
          Return to Schemes Directory
        </Link>
      </div>
    );
  }

  const title =
    language === "mr" && scheme.title_mr
      ? scheme.title_mr
      : language === "hi" && scheme.title_hi
      ? scheme.title_hi
      : scheme.title;

  const desc =
    language === "mr" && scheme.description_mr
      ? scheme.description_mr
      : language === "hi" && scheme.description_hi
      ? scheme.description_hi
      : scheme.description;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {scheme.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {scheme.state}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-600">
            {scheme.code}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Official Government Initiative
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {title}
        </h1>

        <p className="text-xs text-slate-500 flex items-center">
          <Building2 className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
          <span>{scheme.ministry}</span>
        </p>

        {/* Benefits Highlight Box */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Official Benefits & Financial Support
          </span>
          <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
            {scheme.benefits_summary}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Scheme Objective & Scope
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {evaluation && <EligibilityBadge status={evaluation.status} size="lg" />}
            <button
              onClick={handleReEvaluate}
              disabled={evaluating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? "animate-spin" : ""}`} />
              <span>{t.eligibility.reRun}</span>
            </button>
          </div>

          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-102"
            >
              <span>{t.common.applyNow}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Authoritative Rule Evaluation Breakdown */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Transparent Eligibility Evaluation
              </h2>
              <p className="text-xs text-slate-500">
                Evaluation: {evaluation.summary}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Confidence: High Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Passed Rules */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t.eligibility.passedRules} ({evaluation.passed_rules.length})
              </span>
              <div className="space-y-2">
                {evaluation.passed_rules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No rules evaluated as passed.</p>
                ) : (
                  evaluation.passed_rules.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-0.5"
                    >
                      <span className="font-bold text-emerald-950 block">{r.field.toUpperCase()}</span>
                      <p className="text-emerald-800 text-[11px]">{r.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Failed or Missing Rules */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-500" />
                {t.eligibility.failedRules} ({evaluation.failed_rules.length})
              </span>
              <div className="space-y-2">
                {evaluation.failed_rules.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    ✅ No hard eligibility criteria violated.
                  </div>
                ) : (
                  evaluation.failed_rules.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-0.5"
                    >
                      <span className="font-bold text-rose-950 block">{r.field.toUpperCase()}</span>
                      <p className="text-rose-800 text-[11px]">{r.reason}</p>
                    </div>
                  ))
                )}

                {/* Missing documents callout */}
                {evaluation.missing_documents?.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Pending Documents Required:
                    </span>
                    <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5">
                      {evaluation.missing_documents.map((d: string, i: number) => (
                        <li key={i}>
                          <strong>{d}</strong>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/documents"
                      className="inline-flex items-center space-x-1 font-bold text-blue-700 hover:underline pt-1 text-[11px]"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload to fulfill requirement</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
