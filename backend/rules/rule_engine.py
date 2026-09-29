import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("finsaarthi.rules")

class RuleEvaluationDetail:
    def __init__(self, field: str, operator: str, expected_value: Any, actual_value: Any, passed: bool, reason: str = ""):
        self.field = field
        self.operator = operator
        self.expected_value = expected_value
        self.actual_value = actual_value
        self.passed = passed
        self.reason = reason

    def to_dict(self) -> Dict[str, Any]:
        return {
            "field": self.field,
            "operator": self.operator,
            "expected_value": self.expected_value,
            "actual_value": self.actual_value,
            "passed": self.passed,
            "reason": self.reason
        }

class RuleEngine:
    """
    Authoritative Rule & Eligibility Engine.
    Evaluates profile attributes and document status against deterministic criteria.
    """

    OPERATORS = ["==", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN"]

    @staticmethod
    def _normalize(val: Any) -> Any:
        if isinstance(val, str):
            return val.strip().lower()
        return val

    @classmethod
    def evaluate_single_condition(cls, actual: Any, operator: str, expected: Any) -> Tuple[bool, str]:
        op = operator.upper()

        if actual is None:
            return False, "User profile field is missing or undefined"

        try:
            norm_actual = cls._normalize(actual)
            norm_expected = cls._normalize(expected)

            if op == "==":
                passed = (norm_actual == norm_expected)
                reason = "Matched exactly" if passed else f"Expected {expected}, got {actual}"
                return passed, reason

            elif op == "!=":
                passed = (norm_actual != norm_expected)
                reason = "Inequality satisfied" if passed else f"Cannot be {expected}"
                return passed, reason

            elif op == ">":
                passed = float(actual) > float(expected)
                reason = "Criterion satisfied" if passed else f"Value {actual} must be greater than {expected}"
                return passed, reason

            elif op == ">=":
                passed = float(actual) >= float(expected)
                reason = "Criterion satisfied" if passed else f"Value {actual} must be at least {expected}"
                return passed, reason

            elif op == "<":
                passed = float(actual) < float(expected)
                reason = "Criterion satisfied" if passed else f"Value {actual} must be less than {expected}"
                return passed, reason

            elif op == "<=":
                passed = float(actual) <= float(expected)
                reason = "Criterion satisfied" if passed else f"Value {actual} exceeds maximum limit of {expected}"
                return passed, reason

            elif op == "IN":
                if isinstance(expected, list):
                    list_norm = [cls._normalize(x) for x in expected]
                    # Also support "All" in expected
                    if "all" in list_norm or "all india" in list_norm:
                        return True, "Open to all categories"
                    passed = norm_actual in list_norm
                    reason = "Included in eligible list" if passed else f"{actual} is not in eligible list {expected}"
                    return passed, reason
                else:
                    passed = (norm_actual == norm_expected)
                    return passed, "Included" if passed else "Not in eligible list"

            elif op == "NOT_IN":
                if isinstance(expected, list):
                    list_norm = [cls._normalize(x) for x in expected]
                    passed = norm_actual not in list_norm
                    reason = "Not in restricted list" if passed else f"{actual} is restricted in {expected}"
                    return passed, reason
                return True, "Valid"

            else:
                return False, f"Unsupported operator: {operator}"

        except (ValueError, TypeError) as e:
            return False, f"Evaluation type error: {str(e)}"

    @classmethod
    def evaluate_scheme(
        cls,
        user_profile: Dict[str, Any],
        user_documents: List[str],  # list of uploaded document_type strings
        rules: List[Dict[str, Any]],
        required_documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Main deterministic evaluation function.
        Returns:
            status: ELIGIBLE | NOT_ELIGIBLE | MANUAL_REVIEW
            passed_rules: list of passing rule details
            failed_rules: list of failed rule details
            missing_information: list of missing profile keys
            missing_documents: list of required document types not yet submitted
            confidence: HIGH | MEDIUM | LOW
        """
        passed_rules: List[Dict[str, Any]] = []
        failed_rules: List[Dict[str, Any]] = []
        missing_information: List[str] = []
        missing_documents: List[str] = []

        # 1. Evaluate Rule Definitions
        for r in rules:
            field = r.get("field")
            operator = r.get("operator", "==")
            expected = r.get("value")
            is_required = r.get("is_required", True)
            failure_reason = r.get("failure_reason")

            actual = user_profile.get(field)

            # Check if state is All India or open
            if field == "state" and str(expected).strip().lower() in ["all india", "all"]:
                passed_rules.append({
                    "field": field, "operator": operator, "expected_value": expected,
                    "actual_value": actual, "passed": True, "reason": "Open to all Indian States"
                })
                continue

            if field == "gender" and str(expected).strip().lower() in ["all", "any"]:
                passed_rules.append({
                    "field": field, "operator": operator, "expected_value": expected,
                    "actual_value": actual, "passed": True, "reason": "Open to all genders"
                })
                continue

            if actual is None:
                if is_required:
                    missing_information.append(field)
                continue

            # Evaluate condition
            passed, detail_reason = cls.evaluate_single_condition(actual, operator, expected)
            res_dict = {
                "field": field,
                "operator": operator,
                "expected_value": expected,
                "actual_value": actual,
                "passed": passed,
                "reason": failure_reason if (not passed and failure_reason) else detail_reason
            }

            if passed:
                passed_rules.append(res_dict)
            else:
                failed_rules.append(res_dict)

        # 2. Evaluate Required Documents
        uploaded_doc_types = [d.upper() for d in user_documents]
        for doc in required_documents:
            doc_type = doc.get("document_type", "").upper()
            is_mandatory = doc.get("is_mandatory", True)

            if is_mandatory and doc_type not in uploaded_doc_types:
                missing_documents.append(doc_type)

        # 3. Determine Overall Status
        if len(failed_rules) > 0:
            status = "NOT_ELIGIBLE"
            confidence = "HIGH"
            summary = f"Not eligible due to {len(failed_rules)} unmet criteria: " + ", ".join([f['reason'] for f in failed_rules[:2]])
        elif len(missing_information) > 0 or len(missing_documents) > 0:
            status = "MANUAL_REVIEW"
            confidence = "MEDIUM"
            parts = []
            if missing_information:
                parts.append(f"Missing profile details ({', '.join(missing_information)})")
            if missing_documents:
                parts.append(f"Pending documents ({', '.join(missing_documents)})")
            summary = "Action required: " + "; ".join(parts)
        else:
            status = "ELIGIBLE"
            confidence = "HIGH"
            summary = f"All {len(passed_rules)} criteria met and all required documents verified."

        return {
            "status": status,
            "confidence": confidence,
            "passed_rules": passed_rules,
            "failed_rules": failed_rules,
            "missing_information": missing_information,
            "missing_documents": missing_documents,
            "summary": summary
        }
