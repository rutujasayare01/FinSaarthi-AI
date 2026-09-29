"use client";

import React, { useState } from "react";
import {
  Landmark,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  Building2,
  GraduationCap,
  Tractor,
  Briefcase,
  Users,
  HeartPulse,
  Scale
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface GovernmentSource {
  id: string;
  source_name: string;
  department: string;
  government_level: "CENTRAL" | "STATE";
  state?: string;
  category: string;
  official_url: string;
  description: string;
  trust_level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  active_schemes_count: number;
  last_checked: string;
}

const SOURCES_REGISTRY: GovernmentSource[] = [
  {
    id: "myscheme",
    source_name: "myScheme National Platform",
    department: "Ministry of Electronics & IT / MeitY",
    government_level: "CENTRAL",
    category: "All",
    official_url: "https://www.myscheme.gov.in/",
    description: "Central repository of Government Schemes in India covering 1,400+ Central and State welfare programs.",
    trust_level: "LEVEL_1",
    active_schemes_count: 1420,
    last_checked: "28 Sep 2026",
  },
  {
    id: "india-gov",
    source_name: "National Portal of India",
    department: "National Informatics Centre (NIC)",
    government_level: "CENTRAL",
    category: "All",
    official_url: "https://www.india.gov.in/",
    description: "Single window access to information and citizen services provided by the Government of India.",
    trust_level: "LEVEL_1",
    active_schemes_count: 850,
    last_checked: "28 Sep 2026",
  },
  {
    id: "mahadbt",
    source_name: "MahaDBT Portal",
    department: "Government of Maharashtra",
    government_level: "STATE",
    state: "Maharashtra",
    category: "Education",
    official_url: "https://mahadbt.maharashtra.gov.in/",
    description: "Maharashtra State Direct Benefit Transfer portal managing post-matric scholarships, fee concessions, and student allowances.",
    trust_level: "LEVEL_1",
    active_schemes_count: 48,
    last_checked: "28 Sep 2026",
  },
  {
    id: "nsp",
    source_name: "National Scholarship Portal (NSP)",
    department: "Ministry of Education & Social Justice",
    government_level: "CENTRAL",
    category: "Education",
    official_url: "https://scholarships.gov.in/",
    description: "Centralized scholarship portal for pre-matric, post-matric, and higher education financial support for minority and reserved categories.",
    trust_level: "LEVEL_1",
    active_schemes_count: 112,
    last_checked: "28 Sep 2026",
  },
  {
    id: "msme",
    source_name: "Ministry of MSME Portal",
    department: "Ministry of Micro, Small and Medium Enterprises",
    government_level: "CENTRAL",
    category: "Business & MSME",
    official_url: "https://msme.gov.in/",
    description: "Official portal for PM Mudra, PMEGP, Credit Guarantee Trust (CGTMSE), and technology upgrading subsidies for entrepreneurs.",
    trust_level: "LEVEL_1",
    active_schemes_count: 35,
    last_checked: "28 Sep 2026",
  },
  {
    id: "agri",
    source_name: "Department of Agriculture & Farmers Welfare",
    department: "Ministry of Agriculture",
    government_level: "CENTRAL",
    category: "Agriculture",
    official_url: "https://agriculture.gov.in/",
    description: "Source for PM-KISAN, PM Fasal Bima Yojana (PMFBY), Kisan Credit Card (KCC), and micro-irrigation subsidies.",
    trust_level: "LEVEL_1",
    active_schemes_count: 24,
    last_checked: "28 Sep 2026",
  },
  {
    id: "aaple-sarkar",
    source_name: "Aaple Sarkar Maharashtra",
    department: "Revenue & Social Welfare Dept, Maharashtra",
    government_level: "STATE",
    state: "Maharashtra",
    category: "All",
    official_url: "https://aaplesarkar.mahaonline.gov.in/",
    description: "Maharashtra Citizen Services platform for issuing Income Certificates, Domicile Certificates, and Caste Validity Certificates.",
    trust_level: "LEVEL_1",
    active_schemes_count: 72,
    last_checked: "28 Sep 2026",
  },
  {
    id: "wcd",
    source_name: "Ministry of Women & Child Development",
    department: "MWCD, Government of India",
    government_level: "CENTRAL",
    category: "Women & Family",
    official_url: "https://wcd.gov.in/",
    description: "Pradhan Mantri Matru Vandana Yojana (PMMVY), Mahila E-Haat, and Self-Help Group microfinance programs.",
    trust_level: "LEVEL_1",
    active_schemes_count: 19,
    last_checked: "28 Sep 2026",
  },
  {
    id: "depwd",
    source_name: "Empowerment of Persons with Disabilities",
    department: "Ministry of Social Justice & Empowerment",
    government_level: "CENTRAL",
    category: "Social Justice",
    official_url: "https://depwd.gov.in/",
    description: "ADIP Scheme for assistive aids, Divyangjan Swavalamban Yojana, and education stipends for persons with disabilities.",
    trust_level: "LEVEL_1",
    active_schemes_count: 14,
    last_checked: "28 Sep 2026",
  },
  {
    id: "nha",
    source_name: "National Health Authority (Ayushman Bharat)",
    department: "Ministry of Health & Family Welfare",
    government_level: "CENTRAL",
    category: "Healthcare",
    official_url: "https://www.nha.gov.in/",
    description: "Ayushman Bharat PM-JAY providing ₹5 Lakh annual health insurance coverage per family for secondary & tertiary hospitalization.",
    trust_level: "LEVEL_1",
    active_schemes_count: 8,
    last_checked: "28 Sep 2026",
  },
];

const CATEGORIES = [
  "All",
  "Central Government",
  "Maharashtra",
  "Education",
  "Agriculture",
  "Business & MSME",
  "Women & Family",
  "Healthcare",
  "Social Justice",
];

export default function GovernmentResourcesPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSources = SOURCES_REGISTRY.filter((src) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : selectedCategory === "Central Government"
        ? src.government_level === "CENTRAL"
        : selectedCategory === "Maharashtra"
        ? src.state === "Maharashtra"
        : src.category === selectedCategory || src.category === "All";

    const matchesSearch =
      searchQuery.trim() === "" ||
      src.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Government Portal Registry (Level 1 Authority)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === "mr" ? "शासकीय स्रोत केंद्र" : language === "hi" ? "सरकारी संसाधन केंद्र" : "Government Resources Registry"}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
              FinSaarthi AI directly links citizens to authoritative, verified Central and State Government portals. We never scrape unverified third-party websites.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <div className="text-2xl font-black text-amber-300">{SOURCES_REGISTRY.length}</div>
            <div className="text-[11px] text-blue-200 font-semibold">Verified Portals Monitored</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search department or portal..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSources.map((src) => (
          <div
            key={src.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Trust Badge & Level */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {src.trust_level === "LEVEL_1" ? "Level 1 Official Portal" : "Level 2 State Portal"}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {src.government_level}
                </span>
              </div>

              {/* Title & Department */}
              <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                {src.source_name}
              </h3>
              <p className="text-xs font-semibold text-blue-700 mb-2">
                {src.department}
              </p>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {src.description}
              </p>

              {/* Meta stats */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-600 mb-4">
                <span>Active Programs: <strong className="text-slate-900">{src.active_schemes_count}+</strong></span>
                <span>Verified: <strong className="text-slate-900">{src.last_checked}</strong></span>
              </div>
            </div>

            {/* Visit Official Website Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Official Portal</span>
              <a
                href={src.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
