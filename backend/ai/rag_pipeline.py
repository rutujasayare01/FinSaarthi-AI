import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.services.bhashini_service import bhashini_service
from backend.services.embedding_service import search_similar_schemes
from backend.services.eligibility_service import eligibility_service
from backend.ai.llm import gemini_client
from backend.models.all_models import Scheme

logger = logging.getLogger("finsaarthi.rag")

class LangChainRAGPipeline:
    """
    RAG Pipeline orchestrating:
    Query Preprocessing -> Language Detection -> BGE-M3 ChromaDB Search ->
    Rule Engine Structured Evaluation -> Gemini Grounded Explanation.
    """

    def process_query(
        self,
        db: Session,
        query: str,
        user_id: Optional[int] = None,
        language_override: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Language Detection & Preprocessing
        detected_lang = language_override or bhashini_service.detect_language(query)
        logger.info("RAG Processing query: '%s' [Detected Language: %s]", query, detected_lang)

        # 2. Semantic Search using BGE-M3 + ChromaDB
        search_hits = search_similar_schemes(query, top_k=4)

        schemes_referenced = []
        top_scheme_obj = None
        top_eligibility_result = {
            "status": "MANUAL_REVIEW",
            "confidence": "HIGH",
            "summary": "Please login to verify personalized eligibility.",
            "passed_rules": [],
            "failed_rules": [],
            "missing_information": [],
            "missing_documents": []
        }

        context_blocks = []

        if search_hits:
            for hit in search_hits:
                s_id = hit["scheme_id"]
                scheme = db.query(Scheme).filter(Scheme.id == s_id).first()
                if scheme:
                    schemes_referenced.append({
                        "scheme_id": scheme.id,
                        "title": scheme.title if detected_lang == "en" else (scheme.title_mr if detected_lang == "mr" and scheme.title_mr else (scheme.title_hi or scheme.title)),
                        "ministry": scheme.ministry,
                        "official_url": scheme.application_url
                    })

                    desc = scheme.description if detected_lang == "en" else (scheme.description_mr if detected_lang == "mr" and scheme.description_mr else (scheme.description_hi or scheme.description))
                    context_blocks.append(
                        f"Scheme #{scheme.id}: {scheme.title}\n"
                        f"State: {scheme.state} | Ministry: {scheme.ministry} | Category: {scheme.category}\n"
                        f"Benefits: {scheme.benefits_summary}\n"
                        f"Description: {desc}\n"
                        f"Official Application Portal: {scheme.application_url or 'https://www.myscheme.gov.in'}\n"
                    )

                    if top_scheme_obj is None:
                        top_scheme_obj = scheme
        else:
            # Fallback to recent active schemes if vector store is empty
            schemes = db.query(Scheme).filter(Scheme.is_active == True).limit(3).all()
            for s in schemes:
                schemes_referenced.append({
                    "scheme_id": s.id,
                    "title": s.title,
                    "ministry": s.ministry,
                    "official_url": s.application_url
                })
                context_blocks.append(f"Scheme #{s.id}: {s.title} ({s.category}) - {s.benefits_summary}")
                if top_scheme_obj is None:
                    top_scheme_obj = s

        # 3. Rule Engine Structured Evaluation (Deterministic)
        if user_id and top_scheme_obj:
            top_eligibility_result = eligibility_service.evaluate_user_for_scheme(
                db, user_id=user_id, scheme_id=top_scheme_obj.id, record_history=False
            )

        # 4. Gemini Grounded Explanation
        context_str = "\n---\n".join(context_blocks)
        answer = gemini_client.generate_explanation(
            query=query,
            context=context_str,
            eligibility_data=top_eligibility_result,
            language=detected_lang
        )

        suggested_actions = [
            "Check Complete Eligibility",
            "View Required Documents",
            "Upload Missing Certificate"
        ]
        if detected_lang == "mr":
            suggested_actions = [
                "संपूर्ण पात्रता तपासा",
                "आवश्यक कागदपत्रे पहा",
                "प्रलंबित प्रमाणपत्र अपलोड करा"
            ]
        elif detected_lang == "hi":
            suggested_actions = [
                "पात्रता की विस्तृत जांच करें",
                "आवश्यक दस्तावेज देखें",
                "प्रमाण पत्र अपलोड करें"
            ]

        return {
            "reply": answer,
            "detected_language": detected_lang,
            "schemes_referenced": schemes_referenced,
            "eligibility_summary": top_eligibility_result,
            "suggested_actions": suggested_actions
        }

rag_pipeline = LangChainRAGPipeline()
