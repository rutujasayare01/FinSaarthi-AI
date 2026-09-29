"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  PlusCircle,
  Database,
  Activity,
  Users,
  FileCheck2,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AdminPage() {
  const { role } = useAuth();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New scheme form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScheme, setNewScheme] = useState({
    code: "MAHA-TEST-2025",
    title: "Maharashtra Innovation & Startup Grant",
    title_mr: "महाराष्ट्र नवकल्पना व स्टार्ट-अप अनुदान योजना",
    ministry: "Department of Industries, Government of Maharashtra",
    state: "Maharashtra",
    category: "Business",
    description: "Seed grant of up to Rs 5 Lakhs for technology startups founded by students.",
    benefits_summary: "Rs 5,00,000 non-dilutive seed grant with incubation mentorship.",
    application_url: "https://innovation.maharashtra.gov.in",
    deadline: "31-12-2025",
    is_active: true,
    is_demo: true,
  });

  const loadAdminData = async () => {
    try {
      const [schemesData, healthData] = await Promise.all([
        api.schemes.list(),
        fetch("/health").then((r) => r.json()).catch(() => null),
      ]);
      setSchemes(schemesData);
      setHealth(healthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.schemes.create({
        ...newScheme,
        rules: [
          { field: "state", operator: "==", value: "Maharashtra", is_required: true },
          { field: "is_business", operator: "==", value: true, is_required: true }
        ],
        required_documents: [
          { document_type: "PROJECT_REPORT", is_mandatory: true }
        ]
      });
      setShowAddModal(false);
      await loadAdminData();
      alert("✅ Scheme created, validated, and indexed into ChromaDB vector database!");
    } catch (err: any) {
      alert(`Error creating scheme: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Current Role: {role}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Admin & Government Official Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheme Lifecycle Management • Rule Configuration • Ingestion Audits • Health Observability
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Scheme</span>
        </button>
      </div>

      {/* System Health Snapshot */}
      {health && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Infrastructure Components Health
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Status: {health.status}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {Object.entries(health.components || {}).map(([comp, st]: any) => (
              <div key={comp} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {comp.replace("_", " ")}
                </span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {st}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Schemes Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
          <span>Active Government Schemes Registry ({schemes.length})</span>
          <button onClick={loadAdminData} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 font-bold">Code</th>
                <th className="p-3 font-bold">Scheme Title</th>
                <th className="p-3 font-bold">Category</th>
                <th className="p-3 font-bold">State</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {schemes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-bold text-slate-900">{s.code}</td>
                  <td className="p-3 font-semibold text-slate-800">{s.title}</td>
                  <td className="p-3">{s.category}</td>
                  <td className="p-3">{s.state}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active & Indexed
                    </span>
                  </td>
                  <td className="p-3">
                    {s.is_demo ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">DEMO</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">OFFICIAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Publish New Scheme</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Code</label>
                <input
                  type="text"
                  value={newScheme.code}
                  onChange={(e) => setNewScheme({ ...newScheme, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Title</label>
                <input
                  type="text"
                  value={newScheme.title}
                  onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newScheme.category}
                  onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Benefits Summary</label>
                <textarea
                  value={newScheme.benefits_summary}
                  onChange={(e) => setNewScheme({ ...newScheme, benefits_summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 h-16"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Publish & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
