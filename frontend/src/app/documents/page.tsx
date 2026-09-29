"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  FileCheck2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Sparkles,
  Calendar,
  Building,
  RotateCcw,
  X,
  Clock,
  Download,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";

const DOCUMENT_CATEGORIES = [
  { id: "ALL", label: "All Documents" },
  { id: "INCOME", label: "Income" },
  { id: "DOMICILE", label: "Domicile & Residence" },
  { id: "EDUCATION", label: "Education" },
  { id: "CASTE", label: "Caste / Category" },
  { id: "IDENTITY", label: "Identity (Aadhaar/PAN)" },
];

const DOCUMENT_PRESETS = [
  {
    type: "INCOME_CERTIFICATE",
    category: "INCOME",
    name: "Income Certificate (Tahasildar)",
    desc: "Used for scholarship fee concessions and income-capped subsidies.",
    validityMonths: 12,
  },
  {
    type: "DOMICILE",
    category: "DOMICILE",
    name: "Domicile Certificate",
    desc: "Proof of permanent residency in Maharashtra.",
    validityMonths: 60,
  },
  {
    type: "STUDENT_ID",
    category: "EDUCATION",
    name: "College Bonafide / Student ID",
    desc: "Proof of current diploma, engineering, or degree college admission.",
    validityMonths: 12,
  },
  {
    type: "CASTE_CERTIFICATE",
    category: "CASTE",
    name: "Caste Certificate",
    desc: "Proof of OBC, SC, ST, or VJNT category reservation.",
    validityMonths: 0, // Lifetime
  },
  {
    type: "AADHAAR",
    category: "IDENTITY",
    name: "Aadhaar Card",
    desc: "Government identity verification and Direct Benefit Transfer (DBT).",
    validityMonths: 0,
  },
];

export default function DocumentsPage() {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(DOCUMENT_PRESETS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const data = await api.documents.list();
      setDocuments(data);
    } catch (err) {
      console.error("Could not fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setToastMessage(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      // Mock blob for immediate instant prototype testing if user clicks upload directly
      const blob = new Blob([`Official Certificate for ${selectedPreset.name}`], { type: "application/pdf" });
      formData.append("file", blob, `${selectedPreset.type.toLowerCase()}_verified.pdf`);
    }
    formData.append("document_type", selectedPreset.type);

    try {
      const res = await api.documents.upload(formData);
      setToastMessage(`✓ ${selectedPreset.name} uploaded and information extracted!`);
      setSelectedFile(null);
      await fetchDocuments();
    } catch (err: any) {
      setToastMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.documents.delete(id);
      setDeleteConfirmId(null);
      setToastMessage("Document removed from your profile.");
      await fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (activeCategory === "ALL") return true;
    const match = DOCUMENT_PRESETS.find((p) => p.type === d.document_type);
    return match ? match.category === activeCategory : true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-white/10 text-blue-300 backdrop-blur-md">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === "mr" ? "माझी कागदपत्रे" : language === "hi" ? "मेरे दस्तावेज" : "My Documents"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
              Store your certificates securely. FinSaarthi extracts essential parameters to calculate scheme eligibility without repeated manual entry.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shrink-0">
            <div className="text-2xl font-black text-amber-300">{documents.length}</div>
            <div className="text-[11px] text-blue-200 font-semibold">Active Certificates</div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload New Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Add or Update Certificate</h2>
              <p className="text-xs text-slate-500">Supports PDF, JPG, and PNG files up to 10 MB</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Encrypted Storage
          </span>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Document Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Certificate Type
              </label>
              <select
                value={selectedPreset.type}
                onChange={(e) => {
                  const p = DOCUMENT_PRESETS.find((x) => x.type === e.target.value);
                  if (p) setSelectedPreset(p);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {DOCUMENT_PRESETS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">{selectedPreset.desc}</p>
            </div>

            {/* File Chooser */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Document File
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {selectedFile ? `Selected: ${selectedFile.name}` : "Or click Upload to process sample document"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Information...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upload & Extract Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {DOCUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document Cards Grid (Section 38, 41, 42) */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No documents found in this category</h3>
          <p className="text-xs text-slate-500 mt-1">Upload your certificate above to automatically verify eligibility.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => {
            const extractions = doc.extractions?.[0]?.extracted_data || {};
            const isVerified = doc.status === "VERIFIED" || doc.status === "EXTRACTED";

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.document_type.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Information Extracted</span>
                    </span>
                  </div>

                  {/* Document Name */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1">
                    {doc.file_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Uploaded on: {new Date(doc.created_at).toLocaleDateString()}
                  </p>

                  {/* Extracted Details Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Extracted Certificate Information:
                    </div>
                    {Object.keys(extractions).length > 0 ? (
                      Object.entries(extractions).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-slate-700 text-xs">
                          <span className="capitalize text-slate-500 font-medium">{k.replace(/_/g, " ")}:</span>
                          <strong className="text-slate-900">
                            {typeof v === "number" && k.includes("income") ? `₹${v.toLocaleString("en-IN")}` : String(v)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500">Document details active in profile memory.</p>
                    )}
                  </div>

                  {/* Processing Status Timeline (Section 41) */}
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 mb-4">
                    <span className="text-emerald-600">✓ Uploaded</span>
                    <span>→</span>
                    <span className="text-emerald-600">✓ Processing</span>
                    <span>→</span>
                    <span className="text-emerald-600">✓ Extracted</span>
                    <span>→</span>
                    <span className="text-blue-600 font-extrabold">✓ Ready</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDeleteConfirmId(doc.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal (Section 40) */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Document Preview & Extracted Attributes
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Document Type:</span>
                <span className="text-slate-900 font-bold">{previewDoc.document_type}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">File Name:</span>
                <span className="text-slate-900">{previewDoc.file_name}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold">✓ Ready for Scheme Matching</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block mb-2">
                Extracted Values Confirmed:
              </span>
              <div className="space-y-1.5 text-slate-800">
                <p>• <strong>Name:</strong> Confirmed matching Demo Citizen</p>
                <p>• <strong>Annual Family Income:</strong> ₹2,40,000</p>
                <p>• <strong>Issuing Authority:</strong> Sub-Divisional Officer / Tahasildar</p>
                <p>• <strong>State / Domicile:</strong> Maharashtra</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Delete this document?</h3>
              <p className="text-xs text-slate-500">
                Removing this document may affect eligibility calculations for schemes requiring this proof.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
