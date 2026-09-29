"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { VoiceInput } from "@/components/VoiceInput";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  language?: string;
  schemes?: any[];
  eligibilitySummary?: any;
  suggestedActions?: string[];
  timestamp: string;
}

export default function AssistantPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text:
        language === "mr"
          ? "नमस्कार! मी फिनसारथी (FinSaarthi) एआय सहाय्यक आहे. शासकीय योजना, निकष, शिष्यवृत्ती आणि लाभांविषयी अधिकृत माहितीसाठी मला मराठी, हिंदी किंवा इंग्रजीत प्रश्न विचारा."
          : language === "hi"
          ? "नमस्ते! मैं फिनसारथी (FinSaarthi) AI सहायक हूँ। सरकारी योजनाओं, छात्रवृत्ति, कृषि अनुदान और पात्रता सत्यापन के संबंध में आप मुझसे हिंदी, मराठी या अंग्रेजी में पूछ सकते हैं।"
          : "Welcome! I am FinSaarthi AI, your trusted Government Scheme Assistant. Ask me about state & central scholarships, agricultural subsidies, or business loans in Marathi, Hindi, or English.",
      timestamp: "Just now",
      suggestedActions: [
        language === "mr"
          ? "माझ्यासाठी कोणत्या योजना उपलब्ध आहेत?"
          : "Show me scholarships for Maharashtra students.",
        "Check required documents",
        "Explain EBC fee waiver scheme"
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.assistant.chat(textToSend, language);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: res.reply,
        language: res.detected_language,
        schemes: res.schemes_referenced,
        eligibilitySummary: res.eligibility_summary,
        suggestedActions: res.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "We couldn't complete that request right now. Please try asking again or rephrase your question in English, Hindi, or Marathi.",
        timestamp: "Now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in">
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-gov-navy to-blue-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Bot className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base">FinSaarthi AI Assistant</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Official Sources Verified
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              Government Schemes & Benefits • Transparent Eligibility Guidance • Multilingual Voice & Text
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-blue-200 block">Citizen Context:</span>
          <span className="text-xs font-bold text-white">{user?.full_name || "Demo Citizen"} (OBC, Student)</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-amber-300 shadow-md"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
              }`}
            >
              {/* Message text formatted */}
              <div className="whitespace-pre-line font-normal text-xs">{msg.text}</div>

              {/* Referenced Official Sources Card */}
              {msg.schemes && msg.schemes.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Government Sources:
                  </span>
                  <div className="space-y-1">
                    {msg.schemes.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-900"
                      >
                        <span className="font-semibold truncate max-w-[240px]">{s.title}</span>
                        {s.official_url && (
                          <a
                            href={s.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 font-bold text-[10px] flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 text-[11px] font-medium transition-colors"
                    >
                      {action} →
                    </button>
                  ))}
                </div>
              )}

              <span className={`text-[9px] block text-right ${msg.sender === "user" ? "text-blue-200" : "text-slate-400"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-3.5 border border-slate-200 shadow-sm flex items-center space-x-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>FinSaarthi is querying BGE-M3 vector store & evaluating deterministic rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Voice */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-1.5 top-1">
              <VoiceInput onTranscript={(txt) => setInput(txt)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl shadow-md transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
