"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
      <Globe className="w-4 h-4 text-blue-200 ml-1 mr-1" />
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 text-xs font-semibold rounded ${
          language === "en" ? "bg-white text-gov-navy shadow-sm" : "text-white/80 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("mr")}
        className={`px-2 py-1 text-xs font-semibold rounded ${
          language === "mr" ? "bg-white text-gov-navy shadow-sm" : "text-white/80 hover:text-white"
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => setLanguage("hi")}
        className={`px-2 py-1 text-xs font-semibold rounded ${
          language === "hi" ? "bg-white text-gov-navy shadow-sm" : "text-white/80 hover:text-white"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
