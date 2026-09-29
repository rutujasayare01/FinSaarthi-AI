"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  GraduationCap,
  Tractor,
  Briefcase,
  Users,
  ShieldCheck,
  Bookmark,
  FileText,
  ChevronDown,
  Info
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const OCCUPATION_OPTIONS = [
  {
    id: "student",
    icon: GraduationCap,
    labelEn: "Student",
    labelHi: "विद्यार्थी",
    labelMr: "विद्यार्थी",
    occupation: "Student",
    is_student: true,
    is_farmer: false,
    is_business: false,
    defaultIncome: 200000,
  },
  {
    id: "farmer",
    icon: Tractor,
    labelEn: "Farmer / Krishi",
    labelHi: "किसान / कृषि",
    labelMr: "शेतकरी / कृषी",
    occupation: "Farmer",
    is_student: false,
    is_farmer: true,
    is_business: false,
    defaultIncome: 180000,
  },
  {
    id: "business",
    icon: Briefcase,
    labelEn: "Small Business / MSME",
    labelHi: "लघु उद्योग / व्यापारी",
    labelMr: "लघु व्यावसायिक / उद्योजक",
    occupation: "Business",
    is_student: false,
    is_farmer: false,
    is_business: true,
    defaultIncome: 350000,
  },
  {
    id: "woman",
    icon: Users,
    labelEn: "Woman / SHG",
    labelHi: "महिला / स्वयं सहायता",
    labelMr: "महिला बचत गट / उद्योजक",
    occupation: "Entrepreneur",
    gender: "Female",
    is_student: false,
    is_farmer: false,
    is_business: true,
    defaultIncome: 220000,
  },
  {
    id: "general",
    icon: ShieldCheck,
    labelEn: "Worker / Citizen",
    labelHi: "कामगार / नागरिक",
    labelMr: "कामगार / नागरिक",
    occupation: "Citizen",
    is_student: false,
    is_farmer: false,
    is_business: false,
    defaultIncome: 240000,
  },
];

const STATES = [
  "Maharashtra",
  "All India",
  "Gujarat",
  "Karnataka",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Rajasthan",
  "Delhi",
  "West Bengal"
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];

const INCOME_BRACKETS = [
  { label: "Up to ₹1.5 Lakh (BPL / Low Income)", value: 150000 },
  { label: "₹1.5 Lakh - ₹2.5 Lakh (EBC / Scholarship)", value: 240000 },
  { label: "₹2.5 Lakh - ₹8.0 Lakh (Non-Creamy / Mudra)", value: 450000 },
  { label: "Above ₹8.0 Lakh", value: 900000 },
];

export function QuickEligibilityFinder() {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();

  // Form states
  const [selectedPersona, setSelectedPersona] = useState("student");
  const [age, setAge] = useState(21);
  const [state, setState] = useState("Maharashtra");
  const [income, setIncome] = useState(240000);
  const [category, setCategory] = useState("OBC");
  const [gender, setGender] = useState("All");

  // Flow states
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>([]);

  // Prepopulate from user profile if already present
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      if (p.age) setAge(p.age);
      if (p.state) setState(p.state);
      if (p.annual_income) setIncome(p.annual_income);
      if (p.category) setCategory(p.category);
      if (p.gender) setGender(p.gender);

      if (p.is_farmer) setSelectedPersona("farmer");
      else if (p.is_student) setSelectedPersona("student");
      else if (p.is_business) setSelectedPersona("business");
    }
  }, [user]);

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    const persona = OCCUPATION_OPTIONS.find((o) => o.id === personaId);
    if (persona) {
      if (persona.defaultIncome) setIncome(persona.defaultIncome);
      if (persona.gender) setGender(persona.gender);
    }
  };

  const handleQuickCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    const persona = OCCUPATION_OPTIONS.find((o) => o.id === selectedPersona);
    const profilePayload = {
      age: Number(age),
      state,
      annual_income: Number(income),
      category,
      gender: gender || "All",
      occupation: persona?.occupation || "Citizen",
      is_student: persona?.is_student ?? false,
      is_farmer: persona?.is_farmer ?? false,
      is_business: persona?.is_business ?? false,
      has_disability: false,
    };

    try {
      const data = await api.eligibility.quickCheck(profilePayload);
      setResults(data);
      setIsEditing(false);
      setSavedSuccess(data.saved || false);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Quick check failed:", err);
      // Fallback: batch check
      try {
        const batch = await api.eligibility.batch();
        const eligible = batch.results.filter((r: any) => r.status === "ELIGIBLE");
        const manual = batch.results.filter((r: any) => r.status === "MANUAL_REVIEW");
        setResults({
          eligible_count: eligible.length,
          manual_review_count: manual.length,
          eligible_schemes: eligible,
          manual_review_schemes: manual,
          saved: true
        });
        setIsEditing(false);
      } catch (e2) {
        alert("Unable to complete check. Please check connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (schemeId: number) => {
    try {
      await api.users.saveScheme(schemeId);
      setSavedBookmarks((prev) => [...prev, schemeId]);
    } catch (_) {
      setSavedBookmarks((prev) => [...prev, schemeId]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-gov-navy px-6 py-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-amber-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-900">
                  {language === "mr" ? "सुपर सोपे" : language === "hi" ? "आसान खोज" : "Super Simple"}
                </span>
                <span className="text-xs text-blue-200">
                  {language === "mr"
                    ? "फक्त ३० सेकंदात योजना शोधा"
                    : language === "hi"
                    ? "सिर्फ 30 सेकंड में योजनाएं देखें"
                    : "Find your schemes in 30 seconds"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {language === "mr"
                  ? "तुमच्या पात्र सरकारी योजना शोधा"
                  : language === "hi"
                  ? "अपनी पात्र सरकारी योजनाएं जानें"
                  : "Find Your Eligible Government Schemes"}
              </h2>
            </div>
          </div>

          {/* Quick status pill */}
          {!isEditing && results && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-colors border border-white/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === "mr" ? "माहिती बदला" : language === "hi" ? "जानकारी बदलें" : "Edit Info"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {isEditing ? (
          /* STEP 1: SIMPLE QUESTIONNAIRE */
          <form onSubmit={handleQuickCheck} className="space-y-6">
            {/* 1. Who are you? */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                1. {language === "mr" ? "तुम्ही कोण आहात?" : language === "hi" ? "आप कौन हैं?" : "Who are you?"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {OCCUPATION_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPersona === item.id;
                  const label = language === "mr" ? item.labelMr : language === "hi" ? item.labelHi : item.labelEn;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePersonaSelect(item.id)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 text-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm font-bold scale-[1.02]"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl mb-1.5 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Key Details (Age, State, Category, Income) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. {language === "mr" ? "तुमचे वय" : language === "hi" ? "आपकी उम्र" : "Your Age"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="21"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">years</span>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. {language === "mr" ? "तुमचे राज्य" : language === "hi" ? "आपका राज्य" : "Your State"}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Social Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. {language === "mr" ? "सामाजिक प्रवर्ग" : language === "hi" ? "सामाजिक श्रेणी" : "Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Annual Family Income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  5. {language === "mr" ? "वार्षिक कौटुंबिक उत्पन्न" : language === "hi" ? "वार्षिक पारिवारिक आय" : "Family Income"}
                </label>
                <select
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {INCOME_BRACKETS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cloud Sync & 1-Click Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>
                  {language === "mr"
                    ? "माहिती सुरक्षितपणे सेव्ह केली जाईल (Supabase Cloud DB)"
                    : language === "hi"
                    ? "डेटा सुरक्षित रूप से सेव किया जाएगा (Supabase Cloud DB)"
                    : "Info safely synced & saved to your profile (Supabase / Cloud DB)"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating 100+ Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {language === "mr"
                        ? "माझ्या पात्र योजना दाखवा ➔"
                        : language === "hi"
                        ? "मेरी पात्र योजनाएं देखें ➔"
                        : "Show My Eligible Schemes ➔"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: DIRECT RESULTS PRESENTATION */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Congratulatory Summary Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                        {language === "mr"
                          ? `अभिनंदन! तुम्ही ${results?.eligible_count || 0} योजनांसाठी थेट पात्र आहात!`
                          : language === "hi"
                          ? `बधाई हो! आप ${results?.eligible_count || 0} योजनाओं के लिए सीधे पात्र हैं!`
                          : `Great News! You are directly eligible for ${results?.eligible_count || 0} Schemes!`}
                      </h3>
                      {savedSuccess && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                          Saved in Supabase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Matched parameters: <strong>{selectedPersona.toUpperCase()}</strong> • Age <strong>{age}</strong> • State <strong>{state}</strong> • Category <strong>{category}</strong> • Income <strong>₹{income.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                  >
                    Change Parameters
                  </button>
                </div>
              </div>
            </div>

            {/* Eligible Schemes List */}
            {results?.eligible_schemes && results.eligible_schemes.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === "mr"
                      ? "थेट अर्ज करण्यासाठी उपलब्ध योजना"
                      : language === "hi"
                      ? "आवेदन के लिए तैयार योजनाएं"
                      : "Directly Eligible Schemes (Ready to Apply)"}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.eligible_schemes.map((scheme: any) => {
                    const isBookmarked = savedBookmarks.includes(scheme.scheme_id);
                    return (
                      <div
                        key={scheme.scheme_id}
                        className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Tag & Ministry */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              100% ELIGIBLE
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px]">
                              {scheme.ministry || scheme.category || "Govt of Maharashtra"}
                            </span>
                          </div>

                          {/* Title */}
                          <h5 className="text-base font-extrabold text-slate-900 leading-snug mb-2">
                            {scheme.scheme_title}
                          </h5>

                          {/* Key Benefit Banner */}
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 mb-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                              Direct Benefit / सवलत:
                            </div>
                            <div className="text-xs font-bold text-slate-800 mt-0.5">
                              {scheme.benefits_summary || "100% Tuition Fee Waiver & Direct Maintenance Allowance"}
                            </div>
                          </div>

                          {/* Why you match */}
                          <div className="space-y-1 mb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Why You Qualify:
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {scheme.passed_rules?.slice(0, 3).map((r: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                                >
                                  ✓ {r.field}: {String(r.actual_value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleBookmark(scheme.scheme_id)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                              isBookmarked
                                ? "bg-amber-50 text-amber-600 border-amber-300"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                            title="Save scheme"
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                          </button>

                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/schemes/${scheme.scheme_id}`}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Details
                            </Link>

                            <a
                              href={scheme.application_url || "https://mahadbt.maharashtra.gov.in"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
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
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No 100% matched schemes with these exact criteria.</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your income ceiling or state to discover more schemes.</p>
              </div>
            )}

            {/* Schemes needing 1 simple step (Manual Review / 1 Doc Missing) */}
            {results?.manual_review_schemes && results.manual_review_schemes.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === "mr"
                      ? "१ कागदपत्र दिल्यास पात्र होऊ शकणाऱ्या योजना"
                      : language === "hi"
                      ? "1 दस्तावेज जोड़ने पर पात्र योजनाएं"
                      : "Almost Eligible Schemes (Need 1 Document / Step)"}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.manual_review_schemes.map((scheme: any) => (
                    <div
                      key={scheme.scheme_id}
                      className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            1 PROOF NEEDED
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 truncate max-w-[180px]">
                            {scheme.ministry || "Govt of Maharashtra"}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900 mb-1.5">{scheme.scheme_title}</h5>

                        <div className="text-xs text-slate-600 mb-2">
                          {scheme.benefits_summary || "Stipend & Vocational Allowance up to ₹10,000/month"}
                        </div>

                        {scheme.missing_documents && scheme.missing_documents.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-amber-900 font-semibold mb-3">
                            Required: Upload <strong>{scheme.missing_documents.join(", ")}</strong> to qualify.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href="/documents"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Upload Missing Document
                        </Link>
                        <Link
                          href={`/schemes/${scheme.scheme_id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          View Scheme
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
