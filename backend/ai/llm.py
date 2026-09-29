import os
import logging
from typing import Dict, Any, List, Optional
import httpx
from backend.ai.prompts import SYSTEM_RAG_PROMPT, USER_EXPLANATION_PROMPT

logger = logging.getLogger("finsaarthi.llm")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def generate_explanation(
        self,
        query: str,
        context: str,
        eligibility_data: Dict[str, Any],
        language: str = "en"
    ) -> str:
        """
        Generates grounded scheme explanation using Gemini, with intelligent offline fallback.
        """
        passed_rules_str = ", ".join([f"{r.get('field')}: {r.get('reason')}" for r in eligibility_data.get("passed_rules", [])]) or "None"
        failed_rules_str = ", ".join([f"{r.get('field')}: {r.get('reason')}" for r in eligibility_data.get("failed_rules", [])]) or "None"
        missing_str = ", ".join(eligibility_data.get("missing_information", []) + eligibility_data.get("missing_documents", [])) or "None"

        formatted_user_prompt = USER_EXPLANATION_PROMPT.format(
            query=query,
            language="Marathi (मराठी)" if language == "mr" else ("Hindi (हिंदी)" if language == "hi" else "English"),
            eligibility_status=eligibility_data.get("status", "MANUAL_REVIEW"),
            eligibility_summary=eligibility_data.get("summary", ""),
            passed_rules=passed_rules_str,
            failed_rules=failed_rules_str,
            missing_items=missing_str,
            context=context
        )

        if self.is_available():
            try:
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": f"{SYSTEM_RAG_PROMPT.format(language=language)}\n\n{formatted_user_prompt}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 1024
                    }
                }
                url = f"{GEMINI_ENDPOINT}?key={self.api_key}"
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                return text
                    else:
                        logger.warning("Gemini API call failed with status %d: %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("Error calling Gemini API (%s). Falling back to grounded synthesizer.", e)

        # High-Fidelity Grounded Multilingual Fallback Synthesizer
        return self._fallback_synthesizer(query, context, eligibility_data, language)

    def _fallback_synthesizer(
        self,
        query: str,
        context: str,
        eligibility_data: Dict[str, Any],
        language: str
    ) -> str:
        status = eligibility_data.get("status", "MANUAL_REVIEW")
        summary = eligibility_data.get("summary", "")
        missing_docs = eligibility_data.get("missing_documents", [])

        if language == "mr":
            greeting = "नमस्कार! फिनसारथी (FinSaarthi) सहाय्यकामध्ये आपले स्वागत आहे."
            status_desc = {
                "ELIGIBLE": "✅ **अभिनंदन! आपण या योजनेसाठी पात्र (ELIGIBLE) आहात.**",
                "NOT_ELIGIBLE": "❌ **सद्यस्थितीत आपण या योजनेसाठी पात्र नाही (NOT ELIGIBLE).**",
                "MANUAL_REVIEW": "⚠️ **आपल्या पात्रतेसाठी काही कागदपत्रांची पडताळणी बाकी आहे (MANUAL REVIEW).**"
            }.get(status, "⚠️ **पात्रतेची तपासणी प्रलंबित आहे.**")

            body = (
                f"{greeting}\n\n"
                f"{status_desc}\n\n"
                f"**नियम इंजिन मूल्यमापन:** {summary}\n\n"
                f"**योजना तपशील व फायदे:**\n{context}\n\n"
            )
            if missing_docs:
                body += f"📌 **कृपया खालील आवश्यक कागदपत्रे अपलोड करा:** {', '.join(missing_docs)}\n\n"
            body += "🔗 अधिकृत पोर्टलवर जाऊन अर्ज करण्यासाठी कृपया 'Apply Now' वर क्लिक करा."
            return body

        elif language == "hi":
            greeting = "नमस्ते! फिनसारथी (FinSaarthi) AI सहायक में आपका स्वागत है।"
            status_desc = {
                "ELIGIBLE": "✅ **बधाई हो! आप इस योजना के लिए पात्र (ELIGIBLE) हैं।**",
                "NOT_ELIGIBLE": "❌ **वर्तमान में आप इस योजना के मानदंडों को पूरा नहीं करते (NOT ELIGIBLE)।**",
                "MANUAL_REVIEW": "⚠️ **आपकी पात्रता सत्यापन के लिए अतिरिक्त विवरण या दस्तावेज आवश्यक हैं (MANUAL REVIEW)।**"
            }.get(status, "⚠️ **सत्यापन आवश्यक है।**")

            body = (
                f"{greeting}\n\n"
                f"{status_desc}\n\n"
                f"**नियम इंजन मूल्यांकन:** {summary}\n\n"
                f"**योजना विवरण एवं लाभ:**\n{context}\n\n"
            )
            if missing_docs:
                body += f"📌 **कृपया आवश्यक दस्तावेज अपलोड करें:** {', '.join(missing_docs)}\n\n"
            body += "🔗 आधिकारिक पोर्टल पर आवेदन करने के लिए कृपया 'Apply Now' बटन का उपयोग करें।"
            return body

        else:
            greeting = "Welcome to FinSaarthi AI Scheme Assistant."
            status_desc = {
                "ELIGIBLE": "✅ **Congratulations! You are ELIGIBLE for this scheme.**",
                "NOT_ELIGIBLE": "❌ **Currently you do NOT meet the eligibility criteria for this scheme.**",
                "MANUAL_REVIEW": "⚠️ **Your application requires MANUAL REVIEW or additional documents.**"
            }.get(status, "⚠️ **Review Required.**")

            body = (
                f"{greeting}\n\n"
                f"{status_desc}\n\n"
                f"**Authoritative Rule Engine Evaluation:** {summary}\n\n"
                f"**Scheme Details & Benefits:**\n{context}\n\n"
            )
            if missing_docs:
                body += f"📌 **Pending Required Documents:** {', '.join(missing_docs)}\n\n"
            body += "🔗 To proceed with your official application, please use the verified portal link."
            return body

gemini_client = GeminiClient()
