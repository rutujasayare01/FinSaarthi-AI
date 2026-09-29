"use client";

import React, { useState } from "react";
import {
  Users,
  Layout,
  Network,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Languages,
  Activity,
  Cloud,
  ArrowDown,
  ArrowRight,
  Info
} from "lucide-react";

interface ComponentDetail {
  id: string;
  name: string;
  category: string;
  technology: string;
  purpose: string;
  prototypeImpl: string;
  targetArch: string;
  dataFlow: string;
}

const ARCHITECTURE_COMPONENTS: Record<string, ComponentDetail> = {
  users: {
    id: "users",
    name: "User Personas & Multichannel Clients",
    category: "Entry Layer",
    technology: "Citizens, Officials, Admins, Developers",
    purpose: "End-users accessing government scheme discovery, application filing, verification, and analytics.",
    prototypeImpl: "Preconfigured demo personas with instant 1-click role switcher (Citizen, Official, Admin, Dev).",
    targetArch: "National Jan Parichay Single Sign-On + Aadhaar / DigiLocker federated identity.",
    dataFlow: "Citizen enters request via Voice (Marathi/Hindi/English) or UI -> Next.js PWA.",
  },
  frontend: {
    id: "frontend",
    name: "Next.js 14 PWA Presentation Layer",
    category: "Frontend Layer",
    technology: "Next.js, React 18, Tailwind CSS, Web Speech API, Service Workers",
    purpose: "Responsive fintech-grade UI, installable PWA, multilingual dashboard, interactive speech input.",
    prototypeImpl: "Next.js SSR/CSR running on localhost:3000 with dynamic i18n and offline-ready service worker.",
    targetArch: "AWS CloudFront CDN + S3 / Vercel Edge Serverless edge computing.",
    dataFlow: "Captures user query/upload -> Sends authenticated REST calls to NGINX API Gateway (localhost:8080).",
  },
  nginx: {
    id: "nginx",
    name: "NGINX API Gateway",
    category: "Gateway Layer",
    technology: "NGINX Reverse Proxy & Load Balancer",
    purpose: "Reverse proxy, rate limiting, SSL termination, CORS orchestration, and security headers.",
    prototypeImpl: "NGINX listening on :8080 routing /api/ to FastAPI :8000 and / to Next.js :3000.",
    targetArch: "AWS Application Load Balancer (ALB) + AWS API Gateway + Route 53 DNS.",
    dataFlow: "Receives client requests -> Proxies upstream to FastAPI backend services.",
  },
  fastapi: {
    id: "fastapi",
    name: "FastAPI Modular Backend Services",
    category: "Application Layer",
    technology: "Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2",
    purpose: "Core business logic, eligibility orchestration, document ingestion, auth, and search APIs.",
    prototypeImpl: "Uvicorn ASGI micro-framework on :8000 with 10 dedicated service routers.",
    targetArch: "Containerized Microservices on Kubernetes (EKS) with Horizontal Pod Autoscaling (HPA).",
    dataFlow: "Dispatches database queries, triggers rule evaluation, invokes LangChain RAG & Celery queues.",
  },
  rules: {
    id: "rules",
    name: "Deterministic Rule & Eligibility Engine",
    category: "Core Engine Layer",
    technology: "Python Rule Engine, Business Rule Presets",
    purpose: "Authoritative deterministic evaluation of age, income, state, category, and document proofs.",
    prototypeImpl: "Pure Python deterministic engine evaluating rules with ELIGIBLE, NOT_ELIGIBLE, and MANUAL_REVIEW.",
    targetArch: "Microservice Rule Engine with Drools/Python rule repository and audit tracking.",
    dataFlow: "Evaluates citizen profile + verified documents -> Returns authoritative status to RAG and Dashboard.",
  },
  bhashini: {
    id: "bhashini",
    name: "BHASHINI & Whisper Language Layer",
    category: "Speech & Language",
    technology: "Bhashini ULCA Pipeline (STT/MT/TTS) + OpenAI Whisper Fallback",
    purpose: "Real-time multilingual understanding and speech synthesis across Marathi, Hindi, and English.",
    prototypeImpl: "Bhashini adapter with offline high-fidelity dictionary & phonetic fallback.",
    targetArch: "Government of India BHASHINI Production Cloud API + GPU Whisper ASR clusters.",
    dataFlow: "User Speech/Devanagari -> Bhashini translates to English for semantic indexing -> Translates back.",
  },
  rag: {
    id: "rag",
    name: "LangChain Multilingual RAG Pipeline",
    category: "AI / ML Layer",
    technology: "LangChain, BGE-M3 Multilingual Embeddings, Gemini 2.5 Flash",
    purpose: "Grounded natural language answers citing official verified government sources.",
    prototypeImpl: "Cross-lingual embedding retriever with strict hallucination guardrails and fallback synthesizer.",
    targetArch: "Google Gemini 2.5 Flash / Pro + Vertex AI vector search & embeddings.",
    dataFlow: "Query -> BGE-M3 embedding -> ChromaDB search -> Top schemes + Rule status -> Gemini explanation.",
  },
  chroma: {
    id: "chroma",
    name: "ChromaDB Multilingual Vector Store",
    category: "Vector Database",
    technology: "ChromaDB, 1024-dim Vector Index",
    purpose: "Stores semantic representations of scheme benefits, eligibility guidelines, and policies.",
    prototypeImpl: "ChromaDB Persistent Client in ./data/chroma_db with fallback memory vector collection.",
    targetArch: "Milvus / PgVector / Amazon OpenSearch Serverless.",
    dataFlow: "Receives scheme chunks and embeddings -> Computes cosine similarity against user query.",
  },
  postgres: {
    id: "postgres",
    name: "PostgreSQL Primary Relational DB",
    category: "Relational Database",
    technology: "PostgreSQL 16 / Transparent Local SQLite Fallback",
    purpose: "Persists 19 authoritative tables: users, profiles, documents, extractions, rules, notifications.",
    prototypeImpl: "SQLAlchemy with auto-fallback to SQLite when local Postgres daemon is inactive.",
    targetArch: "AWS RDS PostgreSQL Multi-AZ with automated backups and read-replicas.",
    dataFlow: "Stores all structured records, extractions, audit logs, and scheme rules.",
  },
  redis_celery: {
    id: "redis_celery",
    name: "Redis Queue & Celery Background Workers",
    category: "Async & Caching",
    technology: "Redis 7.0, Celery Worker, In-memory Broker Fallback",
    purpose: "Asynchronous OCR document extraction, vector indexing, proactive recommendation alerts.",
    prototypeImpl: "Celery task registry with transparent sync dispatcher for local zero-broker development.",
    targetArch: "Amazon ElastiCache Redis + Celery auto-scaling workers on AWS ECS/EKS.",
    dataFlow: "File upload -> Redis task queue -> Celery worker extracts OCR -> Updates PostgreSQL.",
  },
  observability: {
    id: "observability",
    name: "Observability: Prometheus, Grafana, OpenTelemetry",
    category: "Monitoring & Reliability",
    technology: "Prometheus /metrics, Structured Request IDs, OpenTelemetry",
    purpose: "Tracks latency, throughput, error rates, rule evaluation counts, and system uptime.",
    prototypeImpl: "Native Prometheus client on /metrics with X-Request-ID middleware logging.",
    targetArch: "Grafana Dashboards + AWS CloudWatch Metrics & Traces + Prometheus Server.",
    dataFlow: "Scrapes HTTP latency, RAG duration, and rule execution counts every 15 seconds.",
  },
  infra: {
    id: "infra",
    name: "Container & Cloud Infrastructure",
    category: "Infrastructure",
    technology: "Docker Compose, Kubernetes manifests, AWS EC2/RDS/S3",
    purpose: "Containerized deployment orchestrating frontend, gateway, backend, databases, and workers.",
    prototypeImpl: "Dockerfile + docker-compose.yml + standalone batch/script runners.",
    targetArch: "AWS EKS (Kubernetes), Amazon RDS, AWS S3 Object Storage, Route 53.",
    dataFlow: "Continuous integration & deployment with zero-downtime rolling updates.",
  }
};

export function ArchitectureDiagram() {
  const [selectedId, setSelectedId] = useState<string>("fastapi");
  const selected = ARCHITECTURE_COMPONENTS[selectedId] || ARCHITECTURE_COMPONENTS.fastapi;

  return (
    <div className="space-y-6">
      {/* Interactive Architecture Flow Canvas */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-x-auto text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Technical Approach System Architecture (Interactive)
            </h3>
            <p className="text-xs text-slate-400">
              Click any architecture node below to inspect technology, responsibilities, and data flow.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">
            Selected: {selected.name}
          </span>
        </div>

        {/* Tier 1: Users */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSelectedId("users")}
            className={`px-6 py-3 rounded-2xl border transition-all flex items-center space-x-3 ${
              selectedId === "users"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-105"
                : "bg-slate-900 border-slate-700 hover:border-blue-500"
            }`}
          >
            <Users className="w-5 h-5 text-blue-300" />
            <div className="text-left">
              <span className="text-xs font-bold block">1. USER PERSONAS</span>
              <span className="text-[10px] text-slate-400">Citizen • Official • Admin • Developer</span>
            </div>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />
        </div>

        {/* Tier 2: Presentation & Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          <button
            onClick={() => setSelectedId("frontend")}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
              selectedId === "frontend"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-102"
                : "bg-slate-900 border-slate-700 hover:border-blue-500"
            }`}
          >
            <Layout className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">2. FRONTEND / PWA</span>
              <span className="text-[11px] text-slate-400">Next.js 14 + Tailwind + Voice Input</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedId("nginx")}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
              selectedId === "nginx"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-102"
                : "bg-slate-900 border-slate-700 hover:border-blue-500"
            }`}
          >
            <Network className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">3. API GATEWAY</span>
              <span className="text-[11px] text-slate-400">NGINX (:8080) Reverse Proxy & Security</span>
            </div>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <ArrowDown className="w-5 h-5 text-blue-500" />
        </div>

        {/* Tier 3: Core Application & Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          <button
            onClick={() => setSelectedId("fastapi")}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
              selectedId === "fastapi"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-102"
                : "bg-slate-900 border-slate-700 hover:border-blue-500"
            }`}
          >
            <Server className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">4. BACKEND SERVICES</span>
              <span className="text-[11px] text-slate-400">Python FastAPI (:8000) Modular Routers</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedId("rules")}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
              selectedId === "rules"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-102"
                : "bg-slate-900 border-slate-700 hover:border-blue-500"
            }`}
          >
            <Cpu className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">5. RULE & ELIGIBILITY ENGINE</span>
              <span className="text-[11px] text-slate-400">Deterministic Engine (Authoritative)</span>
            </div>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <ArrowDown className="w-5 h-5 text-blue-500" />
        </div>

        {/* Tier 4: Parallel Branches (Storage, AI/ML, Async, Language) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Branch A: Databases */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Data Layer
            </span>
            <button
              onClick={() => setSelectedId("postgres")}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                selectedId === "postgres"
                  ? "bg-blue-600 border-blue-400 shadow-md"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Database className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">PostgreSQL</span>
                <span className="text-[10px] text-slate-400">19 Relational Schemas</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedId("chroma")}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                selectedId === "chroma"
                  ? "bg-blue-600 border-blue-400 shadow-md"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">ChromaDB</span>
                <span className="text-[10px] text-slate-400">BGE-M3 Vector Store</span>
              </div>
            </button>
          </div>

          {/* Branch B: AI / ML */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              AI / ML Layer
            </span>
            <button
              onClick={() => setSelectedId("rag")}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                selectedId === "rag"
                  ? "bg-blue-600 border-blue-400 shadow-md"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">LangChain + Gemini</span>
                <span className="text-[10px] text-slate-400">Grounded Explanations</span>
              </div>
            </button>
          </div>

          {/* Branch C: Async & Workers */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Workers & Queue
            </span>
            <button
              onClick={() => setSelectedId("redis_celery")}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                selectedId === "redis_celery"
                  ? "bg-blue-600 border-blue-400 shadow-md"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <RefreshCw className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Celery + Redis</span>
                <span className="text-[10px] text-slate-400">OCR & Recommendations</span>
              </div>
            </button>
          </div>

          {/* Branch D: Language & Speech */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Language Layer
            </span>
            <button
              onClick={() => setSelectedId("bhashini")}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                selectedId === "bhashini"
                  ? "bg-blue-600 border-blue-400 shadow-md"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Languages className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">BHASHINI + Whisper</span>
                <span className="text-[10px] text-slate-400">STT / MT / TTS Pipeline</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tier 5: Infra & Observability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setSelectedId("observability")}
            className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
              selectedId === "observability"
                ? "bg-blue-600 border-blue-400"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Prometheus + OpenTelemetry</span>
              <span className="text-[10px] text-slate-400">Latency, Request Counters, Error Scrapes</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedId("infra")}
            className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
              selectedId === "infra"
                ? "bg-blue-600 border-blue-400"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Docker + AWS / Kubernetes</span>
              <span className="text-[10px] text-slate-400">Docker Compose & Cloud Architecture</span>
            </div>
          </button>
        </div>
      </div>

      {/* Component Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md animate-in fade-in">
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-block mb-1.5">
              {selected.category}
            </span>
            <h4 className="text-xl font-extrabold text-slate-900">{selected.name}</h4>
            <p className="text-xs font-mono text-slate-500 mt-0.5">Technology: {selected.technology}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            Active in Prototype
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1 text-xs">🎯 Purpose & Responsibilities:</span>
            <p className="text-slate-600 leading-relaxed">{selected.purpose}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1 text-xs">🔄 Data Flow & Interactions:</span>
            <p className="text-slate-600 leading-relaxed">{selected.dataFlow}</p>
          </div>

          <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
            <span className="font-bold text-blue-900 block mb-1 text-xs">💻 Hackathon Prototype Implementation:</span>
            <p className="text-blue-800 leading-relaxed">{selected.prototypeImpl}</p>
          </div>

          <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100">
            <span className="font-bold text-purple-900 block mb-1 text-xs">☁️ Target Production Architecture:</span>
            <p className="text-purple-800 leading-relaxed">{selected.targetArch}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
