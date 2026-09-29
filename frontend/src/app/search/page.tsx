"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, Sparkles, Languages, Compass, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { VoiceInput } from "@/components/VoiceInput";
import { SchemeCard } from "@/components/SchemeCard";
import { api } from "@/lib/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [detectedLang, setDetectedLang] = useState<string>("en");
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const sampleVoiceQueries = [
    { label: "Marathi Scholarship Search", text: "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा" },
    { label: "English Scholarship Search", text: "Show me scholarships for Maharashtra students." },
    { label: "Diploma Specific Search", text: "Scholarships for diploma students" },
    { label: "Farmer Support Search", text: "Pradhan Mantri Kisan Samman Nidhi" },
  ];

  const executeSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.search.query(text, language);
      setResults(res.results || []);
      setDetectedLang(res.detected_language);
      setTranslatedQuery(res.translated_query);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    executeSearch(text);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Smart Scheme Discovery & Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search across Central and State government welfare programs using voice or keywords in English, मराठी, or हिंदी
        </p>
      </div>

      {/* Main Search Input & Voice */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type or click the microphone to speak in English, मराठी, or हिंदी..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <VoiceInput onTranscript={handleVoiceTranscript} />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gov-navy hover:bg-blue-900 text-white font-bold text-xs rounded-2xl transition-colors shadow-md shrink-0"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Quick Sample Voice Prompts */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Try Sample Voice Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleVoiceQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  executeSearch(item.text);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors flex items-center space-x-1"
              >
                <span>🎤</span>
                <span>"{item.text}"</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Language / Translation Result Callout */}
      {searched && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Results for:</span>
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              "{query}"
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              (Language: {detectedLang.toUpperCase()})
            </span>
          </div>
          {translatedQuery && (
            <span className="text-[11px] text-slate-500 italic">
              Multilingual Query: &quot;{translatedQuery}&quot;
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Searching official government scheme repositories...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-bold text-slate-700">No schemes found for "{query}".</p>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search term or asking FinSaarthi AI.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((hit, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {hit.scheme.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Relevance: {hit.relevance_score}
                  </span>
                </div>
                {hit.eligibility_status && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Status: {hit.eligibility_status}
                  </span>
                )}
              </div>

              <div>
                <a
                  href={`/schemes/${hit.scheme.id}`}
                  className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {hit.scheme.title}
                </a>
                <p className="text-xs text-slate-500 mt-0.5">{hit.scheme.ministry}</p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {hit.snippet || hit.scheme.benefits_summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">State: {hit.scheme.state}</span>
                <a
                  href={`/schemes/${hit.scheme.id}`}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Verify Eligibility & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading search engine...</div>}>
      <SearchContent />
    </Suspense>
  );
}
