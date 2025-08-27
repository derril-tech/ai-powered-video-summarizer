# Project Plan — AI-Powered Video Summarizer

## Current Goal
Deliver a production-ready slice that covers:
1) Upload/paste video → probe + ASR (WhisperX) → chapters,
2) Executive summary + outline,
3) Highlights → short clips with burned-in captions,
4) Searchable transcript with timestamps,
5) Exports (SRT/VTT, MD/PDF) and share links.

## Build Strategy
- Frontend: Next.js 14 (React 18, TS) with shadcn/ui + Tailwind; three-pane workspace (Player • Transcript • Summary).
- API: NestJS gateway (REST /v1, OpenAPI, Problem+JSON, Zod validation, RBAC).
- Workers: Python (FastAPI) — ffprobe, WhisperX ASR, optional diarization, scene + semantic segmentation (PySceneDetect + SBERT), LLM summarization, highlight ranker, ffmpeg clip render, exports (SRT/VTT/PDF/MD), embeddings/search.
- Data: Postgres 16 + pgvector; S3/R2 for originals/captions/clips; Redis for jobs/cache; NATS as the bus.
- Realtime: WS/SSE for ASR progress, chapter/summary streaming, clip render status.
- Observability: OpenTelemetry → Prometheus/Grafana; Sentry for errors; request/trace IDs everywhere.
- Safety/Rights: ownership/allowed-URL check; PII/profanity masking toggle; takedown workflow.

## Success Criteria (Launch)
- First chapters visible **< 90 s p95** on a 60-min video (progressive).
- ASR real-time factor **≤ 0.6× GPU** / **≤ 1.5× CPU**.
- Clip render p95 **< 25 s** for a 30-sec highlight with captions.
- 5xx **< 0.5%/1k**; pipeline success **≥ 99%** (excl. provider outages).
- Summary helpfulness thumbs-up **≥ 80%** on first 100 videos.
