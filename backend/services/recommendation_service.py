import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models.all_models import (
    User, UserInterest, Scheme, Notification
)
from backend.services.eligibility_service import eligibility_service
from backend.services.notification_service import notification_service

logger = logging.getLogger("finsaarthi.recommendations")

class RecommendationService:
    """
    Matches new schemes against user explicit interests and profile data,
    runs rule engine evaluation, and triggers proactive smart notifications.
    """

    @classmethod
    def record_search_interest(cls, db: Session, user_id: int, query_text: str):
        """
        Extracts non-sensitive domain tags from user query and records them.
        """
        terms = query_text.lower().split()
        tag_candidates = {
            "scholarship": "Education",
            "student": "Education",
            "diploma": "Education",
            "college": "Education",
            "शिष्यवृत्ती": "Education",
            "विद्यार्थी": "Education",
            "farmer": "Agriculture",
            "krishi": "Agriculture",
            "crop": "Agriculture",
            "शेतकरी": "Agriculture",
            "business": "Business",
            "startup": "Business",
            "loan": "Finance",
            "subsidy": "Finance",
            "women": "Women & Child Development",
            "maharashtra": "Maharashtra"
        }

        for term, domain in tag_candidates.items():
            if term in query_text.lower():
                existing = db.query(UserInterest).filter(
                    UserInterest.user_id == user_id,
                    UserInterest.tag == domain
                ).first()
                if existing:
                    existing.weight += 0.5
                else:
                    new_interest = UserInterest(
                        user_id=user_id,
                        tag=domain,
                        source="SEARCH",
                        weight=1.0
                    )
                    db.add(new_interest)
        db.commit()

    @classmethod
    def process_new_scheme_alert(cls, db: Session, scheme_id: int):
        """
        Triggered whenever a new scheme is added or updated:
        1. Identifies users with matching interests or matching state/category.
        2. Executes deterministic RuleEngine check.
        3. If status is ELIGIBLE or MANUAL_REVIEW, issues proactive smart alert!
        """
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            return

        users = db.query(User).filter(User.role == "CITIZEN", User.is_active == True).all()

        for user in users:
            # 1. Check if user has demonstrated interest in scheme category or state
            interests = [i.tag.lower() for i in user.user_interests]
            profile_state = user.profile.state.lower() if user.profile else "maharashtra"
            scheme_state = scheme.state.lower()

            state_match = (scheme_state in ["all india", "all"] or scheme_state == profile_state)
            category_match = (scheme.category.lower() in interests or (user.profile and user.profile.is_student and scheme.category.lower() == "education"))

            if state_match and category_match:
                # 2. Run rule engine evaluation
                eval_res = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=scheme.id, record_history=True)

                if eval_res["status"] in ["ELIGIBLE", "MANUAL_REVIEW"]:
                    title = f"🆕 A new {scheme.category} scheme may match you"
                    message = (
                        f"Based on your profile and recent searches, you may qualify for '{scheme.title}'. "
                        f"Status: {eval_res['status']}. {eval_res['summary']}"
                    )
                    notification_service.create_notification(
                        db=db,
                        user_id=user.id,
                        title=title,
                        message=message,
                        notification_type="NEW_SCHEME",
                        action_url=f"/schemes/{scheme.id}",
                        metadata={
                            "scheme_id": scheme.id,
                            "scheme_code": scheme.code,
                            "eligibility_status": eval_res["status"],
                            "confidence": eval_res["confidence"]
                        }
                    )
                    logger.info("Sent proactive new-scheme alert to user %d for scheme %d", user.id, scheme.id)

recommendation_service = RecommendationService()
