"use client";

import React from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { UserCheck, ShieldCheck, Settings, Code } from "lucide-react";

export function RoleSwitcher() {
  const { role, switchRole, isLoading } = useAuth();

  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: "CITIZEN", label: "Citizen", icon: UserCheck, color: "text-emerald-400" },
    { id: "OFFICIAL", label: "Gov Official", icon: ShieldCheck, color: "text-amber-400" },
    { id: "ADMIN", label: "Admin", icon: Settings, color: "text-rose-400" },
    { id: "DEVELOPER", label: "Developer", icon: Code, color: "text-cyan-400" },
  ];

  return (
    <div className="flex items-center space-x-1 bg-slate-900/60 backdrop-blur-md rounded-lg p-1 border border-slate-700">
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1.5 hidden md:inline">
        Demo Persona:
      </span>
      {roles.map((r) => {
        const Icon = r.icon;
        const isActive = role === r.id;
        return (
          <button
            key={r.id}
            onClick={() => switchRole(r.id)}
            disabled={isLoading}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-white/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : r.color}`} />
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
