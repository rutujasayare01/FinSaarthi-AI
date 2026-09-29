import pytest
from backend.rules.rule_engine import RuleEngine

def test_single_condition_equality():
    passed, reason = RuleEngine.evaluate_single_condition("Maharashtra", "==", "Maharashtra")
    assert passed is True

    passed, reason = RuleEngine.evaluate_single_condition("Gujarat", "==", "Maharashtra")
    assert passed is False

def test_numeric_comparisons():
    # Annual income <= 300,000
    passed, _ = RuleEngine.evaluate_single_condition(240000, "<=", 300000)
    assert passed is True

    passed, _ = RuleEngine.evaluate_single_condition(350000, "<=", 300000)
    assert passed is False

    # Age >= 18
    passed, _ = RuleEngine.evaluate_single_condition(21, ">=", 18)
    assert passed is True

    passed, _ = RuleEngine.evaluate_single_condition(16, ">=", 18)
    assert passed is False

def test_in_operator():
    passed, _ = RuleEngine.evaluate_single_condition("OBC", "IN", ["OBC", "SC", "ST"])
    assert passed is True

    passed, _ = RuleEngine.evaluate_single_condition("General", "IN", ["OBC", "SC", "ST"])
    assert passed is False

def test_full_scheme_evaluation_eligible():
    user_profile = {
        "age": 21,
        "annual_income": 240000,
        "state": "Maharashtra",
        "category": "OBC",
        "is_student": True
    }
    user_documents = ["INCOME_CERTIFICATE", "STUDENT_ID"]
    rules = [
        {"field": "state", "operator": "==", "value": "Maharashtra", "is_required": True},
        {"field": "is_student", "operator": "==", "value": True, "is_required": True},
        {"field": "annual_income", "operator": "<=", "value": 800000, "is_required": True}
    ]
    required_docs = [
        {"document_type": "INCOME_CERTIFICATE", "is_mandatory": True},
        {"document_type": "STUDENT_ID", "is_mandatory": True}
    ]

    res = RuleEngine.evaluate_scheme(user_profile, user_documents, rules, required_docs)
    assert res["status"] == "ELIGIBLE"
    assert res["confidence"] == "HIGH"
    assert len(res["passed_rules"]) == 3
    assert len(res["failed_rules"]) == 0
    assert len(res["missing_documents"]) == 0

def test_full_scheme_evaluation_manual_review_missing_doc():
    user_profile = {
        "age": 21,
        "annual_income": 240000,
        "state": "Maharashtra",
        "category": "OBC",
        "is_student": True
    }
    user_documents = ["INCOME_CERTIFICATE", "STUDENT_ID"]
    rules = [
        {"field": "state", "operator": "==", "value": "Maharashtra", "is_required": True},
        {"field": "is_student", "operator": "==", "value": True, "is_required": True}
    ]
    # Caste certificate is required but not uploaded
    required_docs = [
        {"document_type": "INCOME_CERTIFICATE", "is_mandatory": True},
        {"document_type": "CASTE_CERTIFICATE", "is_mandatory": True}
    ]

    res = RuleEngine.evaluate_scheme(user_profile, user_documents, rules, required_docs)
    assert res["status"] == "MANUAL_REVIEW"
    assert "CASTE_CERTIFICATE" in res["missing_documents"]

def test_full_scheme_evaluation_not_eligible():
    user_profile = {
        "age": 21,
        "annual_income": 240000,
        "state": "Maharashtra",
        "is_farmer": False,
        "occupation": "Student"
    }
    user_documents = ["INCOME_CERTIFICATE"]
    rules = [
        {"field": "is_farmer", "operator": "==", "value": True, "is_required": True, "failure_reason": "Must be a farmer"}
    ]
    required_docs = []

    res = RuleEngine.evaluate_scheme(user_profile, user_documents, rules, required_docs)
    assert res["status"] == "NOT_ELIGIBLE"
    assert len(res["failed_rules"]) == 1
