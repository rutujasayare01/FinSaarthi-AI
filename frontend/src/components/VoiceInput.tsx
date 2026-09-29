"use client";

import React, { useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser Speech API fallback: toggle quick audio phrases modal
      setShowPresets(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set recognition language matching selected portal language
      if (language === "mr") {
        recognition.lang = "mr-IN";
      } else if (language === "hi") {
        recognition.lang = "hi-IN";
      } else {
        recognition.lang = "en-IN";
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setShowPresets(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setShowPresets(true);
    }
  };

  const handlePresetSelect = (text: string) => {
    setShowPresets(false);
    onTranscript(text);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={startListening}
        title={isListening ? "Listening..." : "Click to speak"}
        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-105"
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Fallback / Quick Voice Simulator Presets for testing & demo presentation */}
      {showPresets && (
        <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 text-left animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" />
              Voice Input Simulator
            </span>
            <button
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Click a sample speech utterance to test STT processing in {language.toUpperCase()}:
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() =>
                handlePresetSelect(
                  language === "mr"
                    ? "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा"
                    : language === "hi"
                    ? "महाराष्ट्र के छात्रों के लिए छात्रवृत्ति दिखाएं"
                    : "Show me scholarships for Maharashtra students."
                )
              }
              className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-medium border border-blue-200 transition-colors"
            >
              🎤 "{language === "mr" ? "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा" : language === "hi" ? "महाराष्ट्र के छात्रों के लिए छात्रवृत्ति दिखाएं" : "Show me scholarships for Maharashtra students."}"
            </button>
            <button
              onClick={() =>
                handlePresetSelect(
                  language === "mr"
                    ? "माझ्यासाठी कोणत्या योजना उपलब्ध आहेत?"
                    : language === "hi"
                    ? "मेरे लिए कौन सी योजनाएं उपलब्ध हैं?"
                    : "Which schemes are available for me?"
                )
              }
              className="w-full text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-medium border border-emerald-200 transition-colors"
            >
              🎤 "{language === "mr" ? "माझ्यासाठी कोणत्या योजना उपलब्ध आहेत?" : language === "hi" ? "मेरे लिए कौन सी योजनाएं उपलब्ध हैं?" : "Which schemes are available for me?"}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
