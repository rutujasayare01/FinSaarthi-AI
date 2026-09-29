"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.notifications.list(filterUnread);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [filterUnread]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerDemo = async () => {
    try {
      await api.notifications.triggerDemoAlert();
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Alerts & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized updates regarding newly published schemes, deadline reminders, and required documents
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerDemo}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-1.5 transition-colors border border-blue-200"
            title="Scan official feeds for recent updates"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Check for New Scheme Updates</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter tab */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            !filterUnread ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterUnread ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Unread Only
        </button>
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">You&apos;re all caught up!</p>
          <p className="text-xs text-slate-400 mt-1">
            We will notify you when new welfare schemes or deadline updates match your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.is_read
                  ? "bg-amber-50/40 border-amber-200 shadow-sm"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    notif.type === "NEW_SCHEME"
                      ? "bg-blue-100 text-blue-700"
                      : notif.type === "DOCUMENT_REQUIRED"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                {notif.action_url && (
                  <Link
                    href={notif.action_url}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Check Scheme</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5"
                    title="Mark Read"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
