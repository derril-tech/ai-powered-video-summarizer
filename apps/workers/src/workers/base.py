# Created automatically by Cursor AI (2024-12-19)

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from workers.nats_client import NATSClient

logger = logging.getLogger(__name__)


class BaseWorker(ABC):
    """Base class for all workers."""

    def __init__(self, nats_client: NATSClient):
        self.nats_client = nats_client
        self.running = False
        self.subscription = None

    @property
    @abstractmethod
    def subject(self) -> str:
        """NATS subject to subscribe to."""
        pass

    @property
    @abstractmethod
    def worker_name(self) -> str:
        """Worker name for logging."""
        pass

    async def start(self) -> None:
        """Start the worker."""
        self.running = True
        logger.info(f"Starting {self.worker_name} worker")
        
        try:
            self.subscription = await self.nats_client.subscribe(
                self.subject, self._message_handler
            )
            logger.info(f"{self.worker_name} worker started, listening on {self.subject}")
            
            # Keep the worker running
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error in {self.worker_name} worker: {e}")
            raise
        finally:
            await self.stop()

    async def stop(self) -> None:
        """Stop the worker."""
        self.running = False
        if self.subscription:
            await self.subscription.drain()
        logger.info(f"{self.worker_name} worker stopped")

    async def _message_handler(self, msg) -> None:
        """Handle incoming NATS messages."""
        try:
            data = json.loads(msg.data.decode())
            logger.info(f"{self.worker_name} received message: {data.get('id', 'unknown')}")
            
            # Process the message
            result = await self.process_message(data)
            
            # Acknowledge the message
            await msg.ack()
            
            # Publish result if needed
            if result:
                await self.publish_result(result)
                
        except Exception as e:
            logger.error(f"Error processing message in {self.worker_name}: {e}")
            # Negative acknowledgment - message will be redelivered
            await msg.nak()

    @abstractmethod
    async def process_message(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a message. Must be implemented by subclasses."""
        pass

    async def publish_result(self, result: Dict[str, Any]) -> None:
        """Publish processing result to NATS."""
        try:
            await self.nats_client.publish(
                f"{self.subject}.result",
                json.dumps(result).encode()
            )
            logger.info(f"{self.worker_name} published result: {result.get('id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error publishing result from {self.worker_name}: {e}")

    async def publish_error(self, error: str, original_data: Dict[str, Any]) -> None:
        """Publish error to NATS."""
        try:
            error_data = {
                "error": error,
                "original_data": original_data,
                "worker": self.worker_name,
            }
            await self.nats_client.publish(
                f"{self.subject}.error",
                json.dumps(error_data).encode()
            )
            logger.error(f"{self.worker_name} published error: {error}")
        except Exception as e:
            logger.error(f"Error publishing error from {self.worker_name}: {e}")
