"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Bookmark, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SchemeCard } from "@/components/SchemeCard";
import { api } from "@/lib/api";

export default function SchemesPage() {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Education", "Agriculture", "Youth Skill & Employment", "Business"];
  const states = ["All", "Maharashtra", "All India"];

  useEffect(() => {
    async function loadSchemes() {
      setLoading(true);
      try {
        const data = await api.schemes.list(
          categoryFilter !== "All" ? categoryFilter : undefined,
          stateFilter !== "All" ? stateFilter : undefined
        );
        setSchemes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, [categoryFilter, stateFilter]);

  const filteredSchemes = schemes.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.title_mr && s.title_mr.includes(q)) ||
      (s.title_hi && s.title_hi.includes(q)) ||
      s.category.toLowerCase().includes(q) ||
      s.ministry.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.nav.schemes}</h1>
          <p className="text-xs text-slate-500">
            Verified Central & State Government Welfare Programs, Scholarships & Subsidies
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Schemes ({filteredSchemes.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === "saved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" />
            Saved ({savedSchemes.length})
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, or keywords..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>

          {/* State Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Schemes */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading government schemes...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-bold text-slate-700">No schemes found matching the selected filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or searching for another term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((s, idx) => (
            <SchemeCard
              key={s.id}
              scheme={s}
              eligibilityStatus={s.code === "MAHA-EBC-2024" ? "ELIGIBLE" : (s.code === "MAHA-OBC-PMSC" ? "MANUAL_REVIEW" : (s.code === "CENTRAL-PM-KISAN" ? "NOT_ELIGIBLE" : undefined))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
