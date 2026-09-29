"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  Search,
  User,
  ShieldCheck,
  Sparkles,
  LogOut,
  SlidersHorizontal,
  Bookmark,
  FileText,
  Compass,
  CheckCircle,
  Home,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { api } from "@/lib/api";

export function Navbar() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUI();
  const pathname = usePathname();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(1);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await api.notifications.list(true);
        setUnreadCount(notifs.length);
      } catch (_) {}
    };
    fetchNotifications();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    {
      href: "/dashboard",
      label: language === "mr" ? "मुख्य पान" : language === "hi" ? "होम" : "Home",
      icon: Home
    },
    {
      href: "/schemes",
      label: language === "mr" ? "योजना शोधा" : language === "hi" ? "योजनाएं खोजें" : "Discover Schemes",
      icon: Compass
    },
    {
      href: "/eligibility",
      label: language === "mr" ? "माझे लाभ" : language === "hi" ? "मेरे लाभ" : "My Benefits",
      icon: CheckCircle
    },
    {
      href: "/documents",
      label: language === "mr" ? "कागदपत्रे" : language === "hi" ? "दस्तावेज" : "Documents",
      icon: FileText
    },
    {
      href: "/saved",
      label: language === "mr" ? "जतन केलेल्या" : language === "hi" ? "सहेजी गई" : "Saved",
      icon: Bookmark
    },
    {
      href: "/notifications",
      label: language === "mr" ? "सूचना" : language === "hi" ? "अलर्ट्स" : "Alerts",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gov-navy text-white shadow-md border-b border-blue-900/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* LEFT: Hamburger + FinSaarthi AI Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Hamburger Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              title="Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gov-saffron via-white to-gov-green flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-gov-navy rounded-[9px] flex items-center justify-center">
                  <span className="text-gov-saffron font-black text-sm">FS</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                    FinSaarthi AI
                  </span>
                </div>
                <p className="text-[10px] text-blue-200 hidden sm:block tracking-wide">
                  {language === "mr" ? "शासकीय योजना व थेट लाभ" : language === "hi" ? "सरकारी योजना एवं प्रत्यक्ष लाभ" : "Citizen Government Benefits Platform"}
                </p>
              </div>
            </Link>
          </div>

          {/* CENTER: Primary Citizen Destinations (hidden on mobile, visible on desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-white/15 text-white shadow-inner font-extrabold border border-white/20"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-extrabold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Language Switcher, Alerts Bell, Profile Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Quick Search Button (Mobile/Tablet) */}
            <Link
              href="/search"
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Search schemes"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-expanded={profileDropdownOpen}
                aria-label="User Profile Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0) : "D"}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">
                      {user?.full_name || "Demo Citizen"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email || "citizen@finsaarthi.gov.in"}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Profile Active
                    </span>
                  </div>

                  {/* Menu Links */}
                  <div className="py-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 font-semibold"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/profile#personal"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                      <span>Personal Information</span>
                    </Link>

                    <Link
                      href="/profile#notifications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span>Notification Preferences</span>
                    </Link>

                    <Link
                      href="/help#privacy"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Privacy & Security</span>
                    </Link>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        localStorage.clear();
                        window.location.href = "/dashboard";
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout / Reset Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
