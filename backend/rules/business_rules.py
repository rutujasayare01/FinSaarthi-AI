from typing import Dict, Any, List

class BusinessRuleBuilder:
    """
    Helper for constructing validated scheme business rules.
    """
    @staticmethod
    def income_limit_rule(limit: float, field: str = "annual_income", required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": f"Annual Income Cap (<= Rs {int(limit):,})",
            "field": field,
            "operator": "<=",
            "value": limit,
            "is_required": required,
            "failure_reason": f"Annual family income exceeds the eligibility ceiling of Rs {int(limit):,}."
        }

    @staticmethod
    def state_residence_rule(state_name: str, field: str = "state", required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": f"Domicile / State Residence ({state_name})",
            "field": field,
            "operator": "==" if state_name.lower() != "all india" else "IN",
            "value": state_name if state_name.lower() != "all india" else ["All India", "Maharashtra", "Gujarat", "Karnataka", "Delhi", "All"],
            "is_required": required,
            "failure_reason": f"Applicant must be a permanent resident/domicile of {state_name}."
        }

    @staticmethod
    def student_status_rule(required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": "Active Student Status",
            "field": "is_student",
            "operator": "==",
            "value": True,
            "is_required": required,
            "failure_reason": "Applicant must currently be an enrolled student in an accredited institution."
        }

    @staticmethod
    def farmer_status_rule(required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": "Farmer / Agriculturalist Status",
            "field": "is_farmer",
            "operator": "==",
            "value": True,
            "is_required": required,
            "failure_reason": "Applicant or family must be engaged in agricultural landholding."
        }

    @staticmethod
    def business_status_rule(required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": "Entrepreneur / MSME Business Status",
            "field": "is_business",
            "operator": "==",
            "value": True,
            "is_required": required,
            "failure_reason": "Applicant must own or be setting up an enterprise / micro-business."
        }

    @staticmethod
    def category_rule(allowed_categories: List[str], required: bool = True) -> Dict[str, Any]:
        return {
            "rule_name": f"Social Category ({', '.join(allowed_categories)})",
            "field": "category",
            "operator": "IN",
            "value": allowed_categories,
            "is_required": required,
            "failure_reason": f"Only candidates belonging to {', '.join(allowed_categories)} are eligible under this scheme quota."
        }

    @staticmethod
    def age_range_rule(min_age: int, max_age: int) -> List[Dict[str, Any]]:
        return [
            {
                "rule_name": f"Minimum Age ({min_age} years)",
                "field": "age",
                "operator": ">=",
                "value": min_age,
                "is_required": True,
                "failure_reason": f"Applicant must be at least {min_age} years of age."
            },
            {
                "rule_name": f"Maximum Age ({max_age} years)",
                "field": "age",
                "operator": "<=",
                "value": max_age,
                "is_required": True,
                "failure_reason": f"Applicant must not exceed {max_age} years of age."
            }
        ]

    @staticmethod
    def gender_rule(gender: str = "Female") -> Dict[str, Any]:
        return {
            "rule_name": f"Gender Qualification ({gender})",
            "field": "gender",
            "operator": "==",
            "value": gender,
            "is_required": True,
            "failure_reason": f"This program is exclusively reserved for {gender} applicants."
        }
