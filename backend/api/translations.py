from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form
from backend.schemas.all_schemas import TranslateRequest, TranslateResponse, TranscribeResponse, TTSRequest, TTSResponse
from backend.services.bhashini_service import bhashini_service
from backend.services.speech_service import speech_service

router = APIRouter(prefix="/translations", tags=["Bhashini & Speech Translation"])

@router.get("/languages")
def get_supported_languages():
    return {
        "supported_languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"}
        ]
    }

@router.post("/translate", response_model=TranslateResponse)
def translate_text(req: TranslateRequest):
    res = bhashini_service.translate(req.text, req.source_language, req.target_language)
    return res

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_speech(
    audio: Optional[UploadFile] = File(None),
    language: str = Form("mr")
):
    audio_bytes = b""
    filename = "audio.wav"
    if audio:
        audio_bytes = await audio.read()
        filename = audio.filename

    res = speech_service.transcribe_audio(audio_bytes, filename=filename, language_hint=language)
    return res

@router.post("/tts", response_model=TTSResponse)
def text_to_speech(req: TTSRequest):
    res = bhashini_service.text_to_speech(req.text, req.language)
    return res
