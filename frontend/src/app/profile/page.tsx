"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Save,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  UploadCloud,
  Mic,
  AlertTriangle,
  SlidersHorizontal,
  Bell,
  Heart,
  FileCheck2,
  FileText,
  RotateCcw,
  Check,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { VoiceInput } from "@/components/VoiceInput";
import { api } from "@/lib/api";

type ProfileTab = "PERSONAL" | "EDUCATION" | "FINANCIAL" | "LOCATION" | "CATEGORY" | "DOCUMENTS" | "PREFERENCES";

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>("PERSONAL");

  // Profile fields state
  const [formData, setFormData] = useState({
    full_name: "Demo Citizen",
    email: "citizen@finsaarthi.gov.in",
    phone: "+91 98765 43210",
    age: 21,
    gender: "Male",
    state: "Maharashtra",
    district: "Pune",
    occupation: "Student",
    annual_income: 240000,
    category: "OBC",
    is_student: true,
    is_farmer: false,
    is_business: false,
    has_disability: false,
    education_level: "Diploma in Information Technology",
    family_size: 4,
    marital_status: "Single",
  });

  // Source attribution per field (Section 19, 20)
  const [fieldSources, setFieldSources] = useState<Record<string, { source: string; verified: boolean }>>({
    annual_income: { source: "Income Certificate (Tahasildar)", verified: true },
    education_level: { source: "College Bonafide / Student ID", verified: true },
    state: { source: "Entered by you", verified: true },
    category: { source: "Entered by you", verified: true },
    age: { source: "Entered by you", verified: true },
  });

  // Data conflict state (Section 23)
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictData, setConflictData] = useState<{ manual: number; doc: number } | null>(null);

  // Voice understood state (Section 24)
  const [voiceParsedData, setVoiceParsedData] = useState<any | null>(null);

  // Notification preferences state (Section 37)
  const [notifFrequency, setNotifFrequency] = useState("INSTANT");
  const [alertTypes, setAlertTypes] = useState({
    newSchemes: true,
    savedUpdates: true,
    deadlines: true,
    docReminders: true,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.auth.getMe();
        if (res.full_name) {
          setFormData((prev) => ({
            ...prev,
            full_name: res.full_name,
            email: res.email || prev.email,
            phone: res.phone || prev.phone,
          }));
        }
        if (res.profile) {
          setFormData((prev) => ({
            ...prev,
            age: res.profile.age ?? 21,
            gender: res.profile.gender ?? "Male",
            state: res.profile.state ?? "Maharashtra",
            district: res.profile.district ?? "Pune",
            occupation: res.profile.occupation ?? "Student",
            annual_income: res.profile.annual_income ?? 240000,
            category: res.profile.category ?? "OBC",
            is_student: res.profile.is_student ?? true,
            is_farmer: res.profile.is_farmer ?? false,
            is_business: res.profile.is_business ?? false,
            has_disability: res.profile.has_disability ?? false,
            education_level: res.profile.education_level ?? "Diploma in Information Technology",
            family_size: res.profile.family_size ?? 4,
          }));
        }
      } catch (_) {}
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
    }
    // Record that user modified this field
    setFieldSources((prev) => ({
      ...prev,
      [name]: { source: "Entered by you", verified: true },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.users.updateProfile(formData);
      setSuccessMsg("Profile information saved! Eligible schemes have been automatically updated.");
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Voice input handler (Section 24)
  const handleVoiceInput = (transcript: string) => {
    const lower = transcript.toLowerCase();
    const understood: any = {};

    if (lower.includes("विद्यार्थी") || lower.includes("student") || lower.includes("diploma")) {
      understood.occupation = "Student";
      understood.is_student = true;
    }
    if (lower.includes("महाराष्ट्र") || lower.includes("maharashtra")) {
      understood.state = "Maharashtra";
    }
    if (lower.includes("पुणे") || lower.includes("pune")) {
      understood.district = "Pune";
    }
    if (lower.includes("obc") || lower.includes("ओबीसी")) {
      understood.category = "OBC";
    }

    setVoiceParsedData(understood);
  };

  const confirmVoiceData = () => {
    if (voiceParsedData) {
      setFormData((prev) => ({ ...prev, ...voiceParsedData }));
      setVoiceParsedData(null);
      setSuccessMsg("Voice details confirmed and updated in your profile.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-white/10 text-blue-300 backdrop-blur-md">
                <User className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === "mr" ? "माझे प्रोफाईल आणि पात्रता निकष" : language === "hi" ? "मेरी प्रोफाइल एवं पात्रता मानदंड" : "My Profile & Benefits Baseline"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-blue-200">
              Your profile continuously evolves as you upload documents or enter details. Sourced directly from official records.
            </p>
          </div>

          {/* Profile Completion Indicator (Section 18) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-blue-200">Profile Readiness</span>
              <span className="text-emerald-400 font-extrabold">85% Complete</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full w-[85%]" />
            </div>
            <span className="text-[10px] text-blue-200 font-semibold block">
              ✓ Scholarship & Education Profile Ready
            </span>
          </div>
        </div>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Voice parsed confirmation alert (Section 24) */}
      {voiceParsedData && Object.keys(voiceParsedData).length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-purple-900 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Voice Input Understood — Please Confirm:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800">
            {Object.entries(voiceParsedData).map(([k, v]) => (
              <span key={k} className="px-2.5 py-1 rounded-lg bg-white border border-purple-200">
                {k}: <strong>{String(v)}</strong>
              </span>
            ))}
          </div>
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={confirmVoiceData}
              className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-sm"
            >
              ✓ Confirm & Update Profile
            </button>
            <button
              onClick={() => setVoiceParsedData(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Section Tabs (Section 21) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: "PERSONAL", label: "👤 Personal", icon: User },
          { id: "EDUCATION", label: "🎓 Education", icon: GraduationCap },
          { id: "FINANCIAL", label: "💰 Financial", icon: Briefcase },
          { id: "LOCATION", label: "📍 Location", icon: MapPin },
          { id: "CATEGORY", label: "🏷️ Category", icon: ShieldCheck },
          { id: "PREFERENCES", label: "🔔 Alerts & Preferences", icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === "PERSONAL" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (DBT-linked)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDUCATION */}
        {activeTab === "EDUCATION" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Education & Student Status</span>
              {fieldSources.education_level && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ {fieldSources.education_level.source}
                </span>
              )}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Qualification / Course</label>
                <input
                  type="text"
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_student"
                  name="is_student"
                  checked={formData.is_student}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="is_student" className="text-xs font-bold text-slate-800">
                  Currently Enrolled as Active Student (Eligible for Post-Matric Scholarships)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL & OCCUPATION */}
        {activeTab === "FINANCIAL" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Financial Status & Occupation</span>
              {fieldSources.annual_income && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ {fieldSources.annual_income.source}
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  name="annual_income"
                  value={formData.annual_income}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Determines scholarship brackets and EBC tuition fee waivers.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Student">Student (विद्यार्थी)</option>
                  <option value="Farmer">Farmer / Krishi (शेतकरी)</option>
                  <option value="Business">Small Business / MSME (व्यावसायिक)</option>
                  <option value="Worker">Daily Wage Earner / Worker (कामगार)</option>
                  <option value="Citizen">General Citizen (नागरिक)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_farmer"
                  name="is_farmer"
                  checked={formData.is_farmer}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_farmer" className="text-xs font-bold text-slate-800">
                  Agricultural Land Holder / Farmer (Eligible for PM-KISAN, Fasal Bima)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_business"
                  name="is_business"
                  checked={formData.is_business}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_business" className="text-xs font-bold text-slate-800">
                  Small Business Owner / MSME Entrepreneur (Eligible for PM Mudra, PMEGP)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOCATION */}
        {activeTab === "LOCATION" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              Location & Domicile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State of Domicile</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Pune, Thane, Mumbai, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORY */}
        {activeTab === "CATEGORY" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              Social Category & Special Reservations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Social Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="VJNT">VJNT / SBC</option>
                </select>
              </div>

              <div className="pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_disability"
                    name="has_disability"
                    checked={formData.has_disability}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="has_disability" className="text-xs font-bold text-slate-800">
                    Persons with Benchmark Disability (Divyangjan)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PREFERENCES & ALERTS (Section 37) */}
        {activeTab === "PREFERENCES" && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              Alerts & Notification Preferences
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Notification Frequency</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["INSTANT", "DAILY_DIGEST", "WEEKLY_DIGEST", "OFF"].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setNotifFrequency(freq)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      notifFrequency === freq
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {freq.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Notify Me About:</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertTypes.newSchemes}
                    onChange={(e) => setAlertTypes({ ...alertTypes, newSchemes: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">New government schemes matching my profile</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertTypes.savedUpdates}
                    onChange={(e) => setAlertTypes({ ...alertTypes, savedUpdates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Updates or changes to my saved schemes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertTypes.deadlines}
                    onChange={(e) => setAlertTypes({ ...alertTypes, deadlines: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Application deadline reminders (7 days before)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertTypes.docReminders}
                    onChange={(e) => setAlertTypes({ ...alertTypes, docReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Expiring document alerts (Income/Domicile renewal)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save & Voice Input Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Or use voice to update:</span>
            <VoiceInput onTranscript={handleVoiceInput} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Attributes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
