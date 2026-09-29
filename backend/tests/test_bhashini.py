import pytest
from backend.services.bhashini_service import bhashini_service

def test_language_detection():
    # Marathi
    mr_text = "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा"
    assert bhashini_service.detect_language(mr_text) == "mr"

    # Marathi query 2
    mr_q = "माझ्यासाठी कोणत्या योजना उपलब्ध आहेत?"
    assert bhashini_service.detect_language(mr_q) == "mr"

    # Hindi
    hi_text = "महाराष्ट्र के छात्रों के लिए छात्रवृत्ति दिखाएं"
    assert bhashini_service.detect_language(hi_text) == "hi"

    # English
    en_text = "Show me scholarships for Maharashtra students."
    assert bhashini_service.detect_language(en_text) == "en"

def test_translation_service():
    res = bhashini_service.translate(
        "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा",
        source_lang="mr",
        target_lang="en"
    )
    assert "scholarship" in res["translated_text"].lower()
    assert res["source_language"] == "mr"
    assert res["target_language"] == "en"
