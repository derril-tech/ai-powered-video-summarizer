# Created automatically by Cursor AI (2024-12-19)

import logging
from typing import Any, Dict, Optional

import ffmpeg
from workers.base import BaseWorker

logger = logging.getLogger(__name__)


class ProbeWorker(BaseWorker):
    """Worker for extracting video metadata using ffprobe."""

    @property
    def subject(self) -> str:
        return "media.probe"

    @property
    def worker_name(self) -> str:
        return "ProbeWorker"

    async def process_message(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process video probe request."""
        try:
            video_id = data.get("video_id")
            video_path = data.get("video_path")
            
            if not video_id or not video_path:
                raise ValueError("Missing video_id or video_path")
            
            logger.info(f"Probing video {video_id} at {video_path}")
            
            # Extract metadata using ffprobe
            metadata = await self._extract_metadata(video_path)
            
            result = {
                "video_id": video_id,
                "metadata": metadata,
                "status": "completed",
            }
            
            logger.info(f"Completed probing video {video_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error probing video: {e}")
            await self.publish_error(str(e), data)
            return None

    async def _extract_metadata(self, video_path: str) -> Dict[str, Any]:
        """Extract video metadata using ffprobe."""
        try:
            # Get video stream information
            probe = ffmpeg.probe(video_path)
            
            # Extract video stream
            video_stream = None
            audio_stream = None
            
            for stream in probe.get("streams", []):
                if stream.get("codec_type") == "video":
                    video_stream = stream
                elif stream.get("codec_type") == "audio":
                    audio_stream = stream
            
            # Extract format information
            format_info = probe.get("format", {})
            
            metadata = {
                "width": video_stream.get("width") if video_stream else None,
                "height": video_stream.get("height") if video_stream else None,
                "fps": self._parse_fps(video_stream.get("r_frame_rate")) if video_stream else None,
                "bitrate": int(format_info.get("bit_rate", 0)),
                "codec": video_stream.get("codec_name") if video_stream else None,
                "audio_codec": audio_stream.get("codec_name") if audio_stream else None,
                "audio_channels": audio_stream.get("channels") if audio_stream else None,
                "audio_sample_rate": audio_stream.get("sample_rate") if audio_stream else None,
                "duration": float(format_info.get("duration", 0)),
                "size": int(format_info.get("size", 0)),
                "format": format_info.get("format_name"),
            }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            raise

    def _parse_fps(self, fps_str: Optional[str]) -> Optional[float]:
        """Parse FPS string to float."""
        if not fps_str:
            return None
        
        try:
            if "/" in fps_str:
                num, den = fps_str.split("/")
                return float(num) / float(den)
            else:
                return float(fps_str)
        except (ValueError, ZeroDivisionError):
            return None
