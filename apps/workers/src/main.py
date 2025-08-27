# Created automatically by Cursor AI (2024-12-19)

import asyncio
import logging
from contextlib import asynccontextmanager

import nats
from fastapi import FastAPI
from pydantic_settings import BaseSettings

from workers.config import get_settings
from workers.nats_client import NATSClient
from workers.workers import (
    ProbeWorker,
    ASRWorker,
    DiarizationWorker,
    SegmentationWorker,
    SummarizationWorker,
    QuoteWorker,
    HighlightWorker,
    ClipWorker,
    ExportWorker,
    SearchWorker,
    SyncWorker,
    QualityMetricsWorker,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    settings = get_settings()
    
    # Initialize NATS client
    nats_client = NATSClient(settings.nats_url)
    await nats_client.connect()
    
    # Initialize workers
    workers = [
        ProbeWorker(nats_client),
        ASRWorker(nats_client),
        DiarizationWorker(nats_client),
        SegmentationWorker(nats_client),
        SummarizationWorker(nats_client),
        QuoteWorker(nats_client),
        HighlightWorker(nats_client),
        ClipWorker(nats_client),
        ExportWorker(nats_client),
        SearchWorker(nats_client),
        SyncWorker(nats_client),
        QualityMetricsWorker(nats_client),
    ]
    
    # Start workers
    worker_tasks = []
    for worker in workers:
        task = asyncio.create_task(worker.start())
        worker_tasks.append(task)
    
    logger.info(f"Started {len(workers)} workers")
    
    yield
    
    # Cleanup
    for task in worker_tasks:
        task.cancel()
    
    await nats_client.close()
    logger.info("Workers stopped")


app = FastAPI(
    title="AI Video Summarizer Workers",
    description="Background workers for video processing and analysis",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ai-video-summarizer-workers"}


@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    return {"status": "ready"}


@app.get("/live")
async def liveness_check():
    """Liveness check endpoint."""
    return {"status": "alive"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
