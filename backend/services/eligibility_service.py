import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.all_models import (
    User, UserProfile, Document, Scheme, SchemeRule, SchemeDocument,
    EligibilityCheck, EligibilityResult
)
from backend.rules.rule_engine import RuleEngine

logger = logging.getLogger("finsaarthi.eligibility")

class EligibilityService:
    """
    Evaluates citizen profile and documents against scheme rules,
    and records audit logs and historical evaluation results.
    """

    @classmethod
    def evaluate_user_for_scheme(cls, db: Session, user_id: int, scheme_id: int, record_history: bool = True) -> Dict[str, Any]:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            # Fallback default empty profile dictionary
            profile_dict = {
                "age": None,
                "annual_income": None,
                "state": "Maharashtra",
                "category": "General",
                "is_student": False,
                "is_farmer": False,
                "is_business": False,
                "has_disability": False,
                "occupation": "Citizen",
                "gender": "All"
            }
        else:
            profile_dict = {
                "age": profile.age,
                "gender": profile.gender,
                "state": profile.state,
                "district": profile.district,
                "occupation": profile.occupation,
                "annual_income": profile.annual_income,
                "category": profile.category,
                "is_student": profile.is_student,
                "is_farmer": profile.is_farmer,
                "is_business": profile.is_business,
                "has_disability": profile.has_disability,
                "education_level": profile.education_level,
                "family_size": profile.family_size,
                "marital_status": profile.marital_status
            }

        # Fetch verified or uploaded user documents
        docs = db.query(Document).filter(
            Document.user_id == user_id,
            Document.status.in_(["UPLOADED", "EXTRACTED", "VERIFIED"])
        ).all()
        user_documents = [d.document_type for d in docs]

        # Fetch scheme rules and required documents
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            raise ValueError(f"Scheme ID {scheme_id} not found")

        rules = [
            {
                "id": r.id,
                "rule_name": r.rule_name,
                "field": r.field,
                "operator": r.operator,
                "value": r.value,
                "is_required": r.is_required,
                "failure_reason": r.failure_reason
            }
            for r in scheme.rules
        ]

        required_docs = [
            {
                "id": d.id,
                "document_type": d.document_type,
                "is_mandatory": d.is_mandatory,
                "description": d.description
            }
            for d in scheme.required_documents
        ]

        eval_result = RuleEngine.evaluate_scheme(
            user_profile=profile_dict,
            user_documents=user_documents,
            rules=rules,
            required_documents=required_docs
        )

        eval_result["scheme_id"] = scheme.id
        eval_result["scheme_title"] = scheme.title
        eval_result["scheme_code"] = scheme.code
        eval_result["ministry"] = scheme.ministry
        eval_result["category"] = scheme.category
        eval_result["state"] = scheme.state
        eval_result["benefits_summary"] = scheme.benefits_summary
        eval_result["application_url"] = scheme.application_url

        # Persist in eligibility_checks and eligibility_results
        if record_history:
            try:
                check = EligibilityCheck(
                    user_id=user_id,
                    scheme_id=scheme_id,
                    status=eval_result["status"],
                    confidence=eval_result["confidence"],
                    evaluated_at=datetime.utcnow()
                )
                db.add(check)
                db.commit()
                db.refresh(check)

                for rule_res in eval_result["passed_rules"] + eval_result["failed_rules"]:
                    db_rule_result = EligibilityResult(
                        check_id=check.id,
                        rule_id=None,
                        field=rule_res.get("field", ""),
                        operator=rule_res.get("operator", "=="),
                        expected_value=rule_res.get("expected_value"),
                        actual_value=rule_res.get("actual_value"),
                        passed=rule_res.get("passed", False),
                        reason=rule_res.get("reason", "")
                    )
                    db.add(db_rule_result)
                db.commit()
            except Exception as e:
                logger.warning("Failed saving eligibility check history: %s", e)

        return eval_result

    @classmethod
    def evaluate_user_all_schemes(cls, db: Session, user_id: int) -> Dict[str, Any]:
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        results = []
        eligible_count = 0
        manual_review_count = 0
        not_eligible_count = 0

        for s in schemes:
            res = cls.evaluate_user_for_scheme(db, user_id=user_id, scheme_id=s.id, record_history=False)
            results.append(res)
            if res["status"] == "ELIGIBLE":
                eligible_count += 1
            elif res["status"] == "MANUAL_REVIEW":
                manual_review_count += 1
            else:
                not_eligible_count += 1

        return {
            "user_id": user_id,
            "total_schemes_evaluated": len(schemes),
            "eligible_count": eligible_count,
            "manual_review_count": manual_review_count,
            "not_eligible_count": not_eligible_count,
            "results": results
        }

    @classmethod
    def evaluate_profile_dict(cls, db: Session, profile_dict: Dict[str, Any], user_documents: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Direct, instantaneous evaluation of profile parameters without requiring full persistence.
        """
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        results = []
        user_docs = user_documents or []

        for scheme in schemes:
            rules = [
                {
                    "id": r.id,
                    "rule_name": r.rule_name,
                    "field": r.field,
                    "operator": r.operator,
                    "value": r.value,
                    "is_required": r.is_required,
                    "failure_reason": r.failure_reason
                }
                for r in scheme.rules
            ]
            required_docs = [
                {
                    "id": d.id,
                    "document_type": d.document_type,
                    "is_mandatory": d.is_mandatory,
                    "description": d.description
                }
                for d in scheme.required_documents
            ]

            eval_res = RuleEngine.evaluate_scheme(
                user_profile=profile_dict,
                user_documents=user_docs,
                rules=rules,
                required_documents=required_docs
            )

            eval_res["scheme_id"] = scheme.id
            eval_res["scheme_title"] = scheme.title
            eval_res["scheme_code"] = scheme.code
            eval_res["ministry"] = scheme.ministry
            eval_res["category"] = scheme.category
            eval_res["state"] = scheme.state
            eval_res["benefits_summary"] = scheme.benefits_summary
            eval_res["application_url"] = scheme.application_url
            results.append(eval_res)

        return results

eligibility_service = EligibilityService()
