from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import Scheme, SearchHistory, User
from backend.schemas.all_schemas import SearchQueryRequest, SearchResponse, SchemeSearchResult
from backend.services.bhashini_service import bhashini_service
from backend.services.embedding_service import search_similar_schemes
from backend.services.eligibility_service import eligibility_service
from backend.services.recommendation_service import recommendation_service
from backend.api.auth import get_current_user

router = APIRouter(prefix="/search", tags=["Semantic Search & Retrieval"])

@router.post("", response_model=Dict[str, Any])
def search_schemes(
    req: SearchQueryRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = req.query.strip()
    detected_lang = req.language or bhashini_service.detect_language(query)

    # If query is in Marathi or Hindi, translate for logging or keyword matching
    translated = None
    if detected_lang != "en":
        tr_res = bhashini_service.translate(query, detected_lang, "en")
        translated = tr_res.get("translated_text")

    # 1. Semantic Vector Search via ChromaDB + BGE-M3
    search_hits = search_similar_schemes(query, top_k=req.top_k)

    results: List[Dict[str, Any]] = []

    # Map hits to schemes
    found_ids = [h["scheme_id"] for h in search_hits]
    db_schemes = db.query(Scheme).filter(Scheme.id.in_(found_ids), Scheme.is_active == True).all()
    scheme_dict = {s.id: s for s in db_schemes}

    for hit in search_hits:
        s_id = hit["scheme_id"]
        scheme = scheme_dict.get(s_id)
        if not scheme:
            continue

        # Check eligibility for current user if authenticated
        elig_status = None
        if user:
            eval_res = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=scheme.id, record_history=False)
            elig_status = eval_res["status"]

        title_display = scheme.title
        desc_display = scheme.description
        if detected_lang == "mr" and scheme.title_mr:
            title_display = scheme.title_mr
            desc_display = scheme.description_mr or scheme.description
        elif detected_lang == "hi" and scheme.title_hi:
            title_display = scheme.title_hi
            desc_display = scheme.description_hi or scheme.description

        results.append({
            "scheme": {
                "id": scheme.id,
                "code": scheme.code,
                "title": title_display,
                "ministry": scheme.ministry,
                "department": scheme.department,
                "state": scheme.state,
                "category": scheme.category,
                "target_audience": scheme.target_audience,
                "description": desc_display,
                "benefits_summary": scheme.benefits_summary,
                "application_url": scheme.application_url,
                "deadline": scheme.deadline,
                "is_active": scheme.is_active,
                "is_demo": scheme.is_demo,
                "created_at": scheme.created_at
            },
            "relevance_score": round(hit["score"], 3),
            "eligibility_status": elig_status,
            "snippet": scheme.benefits_summary[:180] + "..."
        })

    # If no vector hits, fallback to SQL keyword search
    if not results:
        fallback_query = db.query(Scheme).filter(Scheme.is_active == True)
        if query:
            fallback_query = fallback_query.filter(
                (Scheme.title.ilike(f"%{query}%")) |
                (Scheme.category.ilike(f"%{query}%")) |
                (Scheme.description.ilike(f"%{query}%"))
            )
        for s in fallback_query.limit(req.top_k).all():
            results.append({
                "scheme": {
                    "id": s.id, "code": s.code, "title": s.title, "ministry": s.ministry,
                    "state": s.state, "category": s.category, "benefits_summary": s.benefits_summary,
                    "application_url": s.application_url, "is_demo": s.is_demo, "created_at": s.created_at,
                    "description": s.description, "target_audience": s.target_audience, "is_active": s.is_active
                },
                "relevance_score": 0.85,
                "eligibility_status": "ELIGIBLE" if user and user.profile and user.profile.is_student and s.category == "Education" else "MANUAL_REVIEW",
                "snippet": s.benefits_summary
            })

    # 2. Record Search Interest for Proactive Alerting
    if user:
        recommendation_service.record_search_interest(db, user.id, query)
        if translated:
            recommendation_service.record_search_interest(db, user.id, translated)

        history = SearchHistory(
            user_id=user.id,
            query_text=query,
            language=detected_lang,
            result_count=len(results),
            searched_at=datetime.utcnow()
        )
        db.add(history)
        db.commit()

    return {
        "query": query,
        "detected_language": detected_lang,
        "translated_query": translated,
        "total_results": len(results),
        "results": results
    }
