# Created automatically by Cursor AI (2024-12-19)

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    database_url: str = Field(..., env="DATABASE_URL")
    
    # NATS
    nats_url: str = Field("nats://localhost:4222", env="NATS_URL")
    nats_cluster_id: str = Field("ai-video-summarizer", env="NATS_CLUSTER_ID")
    nats_client_id: str = Field("worker", env="NATS_CLIENT_ID")
    
    # S3/Storage
    s3_endpoint: str = Field(..., env="S3_ENDPOINT")
    s3_region: str = Field("auto", env="S3_REGION")
    s3_access_key_id: str = Field(..., env="S3_ACCESS_KEY_ID")
    s3_secret_access_key: str = Field(..., env="S3_SECRET_ACCESS_KEY")
    s3_bucket_name: str = Field(..., env="S3_BUCKET_NAME")
    
    # Redis
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")
    redis_password: Optional[str] = Field(None, env="REDIS_PASSWORD")
    
    # AI/ML Settings
    whisperx_model: str = Field("large-v2", env="WHISPERX_MODEL")
    whisperx_device: str = Field("cuda", env="WHISPERX_DEVICE")
    whisperx_compute_type: str = Field("float16", env="WHISPERX_COMPUTE_TYPE")
    
    # API Keys
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    
    # Worker Settings
    worker_concurrency: int = Field(4, env="WORKER_CONCURRENCY")
    max_retries: int = Field(3, env="MAX_RETRIES")
    retry_delay: int = Field(5, env="RETRY_DELAY")
    
    # Logging
    log_level: str = Field("INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
