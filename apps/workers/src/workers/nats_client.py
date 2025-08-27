# Created automatically by Cursor AI (2024-12-19)

import json
import logging
from typing import Any, Callable, Dict

import nats

logger = logging.getLogger(__name__)


class NATSClient:
    """NATS client wrapper for workers."""

    def __init__(self, url: str):
        self.url = url
        self.nc = None

    async def connect(self) -> None:
        """Connect to NATS server."""
        try:
            self.nc = await nats.connect(self.url)
            logger.info(f"Connected to NATS at {self.url}")
        except Exception as e:
            logger.error(f"Failed to connect to NATS: {e}")
            raise

    async def close(self) -> None:
        """Close NATS connection."""
        if self.nc:
            await self.nc.close()
            logger.info("NATS connection closed")

    async def subscribe(self, subject: str, callback: Callable) -> nats.Subscription:
        """Subscribe to a NATS subject."""
        if not self.nc:
            raise RuntimeError("NATS client not connected")
        
        subscription = await self.nc.subscribe(subject, cb=callback)
        logger.info(f"Subscribed to {subject}")
        return subscription

    async def publish(self, subject: str, payload: bytes) -> None:
        """Publish a message to NATS."""
        if not self.nc:
            raise RuntimeError("NATS client not connected")
        
        await self.nc.publish(subject, payload)
        logger.debug(f"Published message to {subject}")

    async def publish_json(self, subject: str, data: Dict[str, Any]) -> None:
        """Publish JSON data to NATS."""
        payload = json.dumps(data).encode()
        await self.publish(subject, payload)

    async def request(self, subject: str, payload: bytes, timeout: float = 5.0) -> bytes:
        """Send a request and wait for response."""
        if not self.nc:
            raise RuntimeError("NATS client not connected")
        
        response = await self.nc.request(subject, payload, timeout=timeout)
        return response.data

    async def request_json(self, subject: str, data: Dict[str, Any], timeout: float = 5.0) -> Dict[str, Any]:
        """Send a JSON request and wait for response."""
        payload = json.dumps(data).encode()
        response_data = await self.request(subject, payload, timeout)
        return json.loads(response_data.decode())
