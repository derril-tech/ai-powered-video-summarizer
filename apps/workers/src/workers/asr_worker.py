# Created automatically by Cursor AI (2024-12-19)

import logging
from typing import Any, Dict, Optional

import whisperx
from workers.base import BaseWorker

logger = logging.getLogger(__name__)


class ASRWorker(BaseWorker):
    """Worker for Automatic Speech Recognition using WhisperX."""

    def __init__(self, nats_client):
        super().__init__(nats_client)
        self.model = None
        self.device = "cuda"  # Will be configurable

    @property
    def subject(self) -> str:
        return "media.asr"

    @property
    def worker_name(self) -> str:
        return "ASRWorker"

    async def process_message(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process ASR request."""
        try:
            video_id = data.get("video_id")
            audio_path = data.get("audio_path")
            language = data.get("language", "en")
            
            if not video_id or not audio_path:
                raise ValueError("Missing video_id or audio_path")
            
            logger.info(f"Starting ASR for video {video_id}")
            
            # Load model if not loaded
            if self.model is None:
                await self._load_model()
            
            # Perform transcription
            transcript = await self._transcribe_audio(audio_path, language)
            
            result = {
                "video_id": video_id,
                "transcript": transcript,
                "status": "completed",
            }
            
            logger.info(f"Completed ASR for video {video_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in ASR processing: {e}")
            await self.publish_error(str(e), data)
            return None

    async def _load_model(self) -> None:
        """Load WhisperX model."""
        try:
            logger.info("Loading WhisperX model...")
            self.model = whisperx.load_model("large-v2", self.device)
            logger.info("WhisperX model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading WhisperX model: {e}")
            raise

    async def _transcribe_audio(self, audio_path: str, language: str) -> Dict[str, Any]:
        """Transcribe audio using WhisperX."""
        try:
            # Transcribe audio
            result = self.model.transcribe(audio_path, language=language)
            
            # Align timestamps
            model_a, metadata = whisperx.load_align_model(
                language_code=language, device=self.device
            )
            result = whisperx.align(
                result["segments"],
                model_a,
                metadata,
                audio_path,
                self.device,
                return_char_alignments=False,
            )
            
            # Extract words with timestamps
            words = []
            for segment in result["segments"]:
                for word in segment.get("words", []):
                    words.append({
                        "text": word["word"],
                        "start": word["start"],
                        "end": word["end"],
                        "confidence": word.get("score", 0.0),
                    })
            
            transcript = {
                "words": words,
                "segments": result["segments"],
                "language": language,
                "confidence": result.get("confidence", 0.0),
            }
            
            return transcript
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
