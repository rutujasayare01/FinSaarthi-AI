import os
import logging
from typing import Dict, Any, Optional
from backend.services.bhashini_service import bhashini_service

logger = logging.getLogger("finsaarthi.speech")

class SpeechService:
    """
    Handles speech input processing with Whisper fallback and Bhashini integration.
    """

    def __init__(self):
        self._whisper_model = None

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav", language_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Transcribes audio using Whisper if installed/available, or Bhashini STT adapter.
        """
        # Try local whisper if requested and available
        if os.getenv("ENABLE_LOCAL_WHISPER", "false").lower() == "true":
            try:
                import whisper
                if self._whisper_model is None:
                    logger.info("Loading Whisper model for local transcription...")
                    self._whisper_model = whisper.load_model("base")
                # write temp file and transcribe
                temp_path = f"./data/temp_{filename}"
                with open(temp_path, "wb") as f:
                    f.write(audio_bytes)
                result = self._whisper_model.transcribe(temp_path, language=language_hint)
                os.remove(temp_path)
                return {
                    "text": result.get("text", "").strip(),
                    "detected_language": result.get("language", language_hint or "en"),
                    "confidence": 0.95,
                    "provider": "Local OpenAI Whisper Engine"
                }
            except Exception as e:
                logger.warning("Local Whisper transcription failed (%s). Delegating to Bhashini STT.", e)

        # Fallback to Bhashini STT adapter
        return bhashini_service.speech_to_text(audio_bytes, language=language_hint or "mr")

speech_service = SpeechService()
