"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  Compass,
  CheckCircle,
  FileText,
  Bookmark,
  Bell,
  Bot,
  Landmark,
  History,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUI } from "@/context/UIContext";

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { isSidebarOpen, closeSidebar } = useUI();

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const navItems = [
    {
      href: "/dashboard",
      labelEn: "Home",
      labelMr: "मुख्य पान",
      labelHi: "होम",
      icon: Home,
    },
    {
      href: "/schemes",
      labelEn: "Discover Schemes",
      labelMr: "योजना शोधा",
      labelHi: "योजनाएं खोजें",
      icon: Compass,
    },
    {
      href: "/eligibility",
      labelEn: "My Benefits",
      labelMr: "माझे लाभ",
      labelHi: "मेरे लाभ",
      icon: CheckCircle,
      highlight: true,
    },
    {
      href: "/documents",
      labelEn: "My Documents",
      labelMr: "माझी कागदपत्रे",
      labelHi: "मेरे दस्तावेज",
      icon: FileText,
    },
    {
      href: "/saved",
      labelEn: "Saved Schemes",
      labelMr: "जतन केलेल्या योजना",
      labelHi: "सहेजी गई योजनाएं",
      icon: Bookmark,
    },
    {
      href: "/notifications",
      labelEn: "Notifications & Alerts",
      labelMr: "सूचना आणि पूर्वसूचना",
      labelHi: "सूचनाएं एवं अलर्ट्स",
      icon: Bell,
    },
    {
      href: "/assistant",
      labelEn: "FinSaarthi AI",
      labelMr: "फिनसारथी एआय सहाय्यक",
      labelHi: "फिनसारथी एआई सहायक",
      icon: Bot,
      isAi: true,
    },
    {
      href: "/resources",
      labelEn: "Government Resources",
      labelMr: "शासकीय स्रोत केंद्र",
      labelHi: "सरकारी संसाधन केंद्र",
      icon: Landmark,
    },
    {
      href: "/search",
      labelEn: "Search History",
      labelMr: "शोध इतिहास",
      labelHi: "खोज इतिहास",
      icon: History,
    },
    {
      href: "/help",
      labelEn: "Help & Guidance",
      labelMr: "मदत आणि मार्गदर्शन",
      labelHi: "सहायता और मार्गदर्शन",
      icon: HelpCircle,
    },
  ];

  return (
    <>
      {/* Backdrop overlay (visible only when open) */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-out ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-slate-900 text-slate-200 z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        {/* Top Header inside Drawer */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gov-saffron via-white to-gov-green flex items-center justify-center p-0.5 shadow">
              <div className="w-full h-full bg-gov-navy rounded-[8px] flex items-center justify-center">
                <span className="text-gov-saffron font-black text-xs">FS</span>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">
                FinSaarthi AI
              </span>
              <span className="text-[10px] text-blue-300 font-medium">
                Citizen Benefits Platform
              </span>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Citizen Services
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const label =
              language === "mr" ? item.labelMr : language === "hi" ? item.labelHi : item.labelEn;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : item.isAi
                        ? "text-purple-400"
                        : item.highlight
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />
                  <span>{label}</span>
                </div>

                {item.isAi ? (
                  <span className="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                    AI
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isActive ? "opacity-90" : ""}`} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Callout & Trust Statement */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-gradient-to-br from-blue-950/80 to-slate-950 rounded-xl border border-blue-900/40 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-300 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Need Quick Assistance?</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Speak or ask questions in Marathi, Hindi, or English.
            </p>
            <Link
              href="/assistant"
              onClick={closeSidebar}
              className="block w-full py-1.5 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              Ask FinSaarthi AI
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Official Government Sources Verified</span>
          </div>
        </div>
      </aside>
    </>
  );
}
