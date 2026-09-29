import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.models.all_models import Scheme, SchemeRule, SchemeDocument, SchemeUpdate
from backend.services.embedding_service import generate_embedding
from backend.database.chroma_client import schemes_collection

logger = logging.getLogger("finsaarthi.schemes")

class SchemeService:
    """
    Manages schemes, rules, required documents, and vector index synchronization.
    """

    @classmethod
    def get_all(cls, db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None, state: Optional[str] = None) -> List[Scheme]:
        query = db.query(Scheme).filter(Scheme.is_active == True)
        if category and category.lower() != "all":
            query = query.filter(Scheme.category.ilike(f"%{category}%"))
        if state and state.lower() != "all india" and state.lower() != "all":
            query = query.filter((Scheme.state.ilike(f"%{state}%")) | (Scheme.state == "All India"))
        return query.offset(skip).limit(limit).all()

    @classmethod
    def get_by_id(cls, db: Session, scheme_id: int) -> Optional[Scheme]:
        return db.query(Scheme).filter(Scheme.id == scheme_id).first()

    @classmethod
    def get_by_code(cls, db: Session, code: str) -> Optional[Scheme]:
        return db.query(Scheme).filter(Scheme.code == code).first()

    @classmethod
    def create_scheme(cls, db: Session, data: Dict[str, Any], trigger_discovery: bool = True) -> Scheme:
        rules_data = data.pop("rules", [])
        docs_data = data.pop("required_documents", [])

        scheme = Scheme(**data)
        db.add(scheme)
        db.commit()
        db.refresh(scheme)

        # Add rules
        for r in rules_data:
            rule_obj = SchemeRule(
                scheme_id=scheme.id,
                rule_name=r.get("rule_name", "Condition"),
                field=r.get("field"),
                operator=r.get("operator", "=="),
                value=r.get("value"),
                is_required=r.get("is_required", True),
                failure_reason=r.get("failure_reason")
            )
            db.add(rule_obj)

        # Add required documents
        for d in docs_data:
            doc_obj = SchemeDocument(
                scheme_id=scheme.id,
                document_type=d.get("document_type"),
                is_mandatory=d.get("is_mandatory", True),
                description=d.get("description", "")
            )
            db.add(doc_obj)

        db.commit()
        db.refresh(scheme)

        # Sync to ChromaDB
        cls.index_scheme_in_chroma(scheme)

        if trigger_discovery:
            # Trigger proactive new scheme discovery alert
            from backend.services.recommendation_service import recommendation_service
            try:
                recommendation_service.process_new_scheme_alert(db, scheme.id)
            except Exception as e:
                logger.warning("Error triggering proactive alert for new scheme %s: %s", scheme.id, e)

        return scheme

    @classmethod
    def index_scheme_in_chroma(cls, scheme: Scheme):
        """Creates semantic embedding for scheme and indexes in ChromaDB."""
        try:
            text_representation = (
                f"Scheme: {scheme.title}\n"
                f"Ministry: {scheme.ministry}\n"
                f"State: {scheme.state}\n"
                f"Category: {scheme.category}\n"
                f"Target Audience: {scheme.target_audience}\n"
                f"Description: {scheme.description}\n"
                f"Benefits: {scheme.benefits_summary}"
            )
            embedding = generate_embedding(text_representation)
            schemes_collection.upsert(
                ids=[str(scheme.id)],
                embeddings=[embedding],
                documents=[text_representation],
                metadatas=[{
                    "title": scheme.title,
                    "code": scheme.code,
                    "state": scheme.state,
                    "category": scheme.category,
                    "is_demo": bool(scheme.is_demo)
                }]
            )
            logger.info("Indexed scheme ID %d (%s) into ChromaDB.", scheme.id, scheme.code)
        except Exception as e:
            logger.warning("Failed indexing scheme %d into ChromaDB: %s", scheme.id, e)

scheme_service = SchemeService()
