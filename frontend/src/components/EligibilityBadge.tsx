"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface EligibilityBadgeProps {
  status: "ELIGIBLE" | "NOT_ELIGIBLE" | "MANUAL_REVIEW" | string;
  size?: "sm" | "md" | "lg";
}

export function EligibilityBadge({ status, size = "md" }: EligibilityBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs space-x-1",
    md: "px-2.5 py-1 text-xs space-x-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold space-x-2",
  }[size];

  if (status === "ELIGIBLE") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 ${sizeClasses}`}
      >
        <CheckCircle2 className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        <span>{t.eligibility.statusEligible}</span>
      </span>
    );
  }

  if (status === "NOT_ELIGIBLE") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-300 ${sizeClasses}`}
      >
        <XCircle className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        <span>{t.eligibility.statusNotEligible}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300 ${sizeClasses}`}
    >
      <AlertCircle className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span>{t.eligibility.statusReview}</span>
    </span>
  );
}
