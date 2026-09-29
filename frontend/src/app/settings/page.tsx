"use client";

import React, { useState } from "react";
import { Settings as SettingsIcon, Bell, Globe, Server, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [frequency, setFrequency] = useState("INSTANT");
  const [channels, setChannels] = useState({
    inApp: true,
    push: true,
    email: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          Settings & System Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure interface language, smart notification dispatch frequency, and gateway endpoints.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Portal Interface & Assistant Language
          </h3>
          <p className="text-xs text-slate-500">
            Select the primary language for scheme descriptions, AI voice interactions, and rule explanations.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "en", name: "English", desc: "Standard official English" },
              { id: "mr", name: "मराठी (Marathi)", desc: "महाराष्ट्र शासन अधिकृत भाषा" },
              { id: "hi", name: "हिंदी (Hindi)", desc: "केंद्रीय आधिकारिक भाषा" },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  language === l.id
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="font-extrabold text-xs text-slate-900 block">{l.name}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Configuration (Section 17) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Notification Channels & Delivery Cadence
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dispatch Frequency (User Control)
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                <option value="INSTANT">Instant Alert (Immediately upon new scheme match)</option>
                <option value="DAILY_DIGEST">Daily Digest (Once daily consolidated brief)</option>
                <option value="WEEKLY_DIGEST">Weekly Digest (Weekly digest of relevant schemes)</option>
                <option value="OFF">Off (Disable proactive push notifications)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="block font-bold text-slate-700">Active Delivery Channels</span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.inApp}
                  onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800 font-medium">In-App Notification Center</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800 font-medium">Web Browser Push Notifications</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800 font-medium">Email Alerts (Target AWS SES Architecture)</span>
              </label>
            </div>
          </div>
        </div>

        {/* API Gateway Configuration Reference */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            Gateway Routing Architecture
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[9px]">FRONTEND:</span>
              <span className="font-bold text-slate-800">localhost:3000</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[9px]">API GATEWAY:</span>
              <span className="font-bold text-slate-800">localhost:8080 (NGINX)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[9px]">BACKEND SERVICES:</span>
              <span className="font-bold text-slate-800">localhost:8000 (FastAPI)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
