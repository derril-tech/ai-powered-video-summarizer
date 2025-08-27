# Architecture Overview — AI-Powered Video Summarizer

## Topology
- Frontend: Next.js 14 (shadcn/ui + Tailwind), SSR for viewer/editor.
- API Gateway: NestJS (REST /v1, OpenAPI 3.1, Zod DTOs, Problem+JSON, RBAC/RLS, rate limits, Idempotency-Key).
- Workers (Python/FastAPI):
  probe-worker • asr-worker (WhisperX) • diar-worker (pyannote, optional) • segment-worker (PySceneDetect + SBERT) • summarize-worker • quote-worker • highlight-worker • clip-worker (ffmpeg) • export-worker • search-worker (pgvector) • sync-worker (Notion/GDocs/YouTube).
- Eventing: NATS subjects for media.ingest/asr/segment/summarize/highlight/clip/export/sync; Redis Streams for short tasks.
- Storage: Postgres 16 + pgvector; S3/R2 for originals, captions, clips, thumbnails; Redis cache/session; optional ClickHouse for analytics.
- Observability: OTel traces/logs/metrics → Prometheus/Grafana; Sentry for exceptions.
- Secrets: Cloud KMS/Secrets Manager; per-tenant S3 prefixes; signed URLs.

## Core Data (Postgres)
- Tenancy: orgs, users, memberships, projects.
- Videos: videos(meta/status), transcripts(words+confidence, diarization), segments(kind=scene/topic/slide), chapters(non-overlapping), summaries(exec/outline/abstract/faq), quotes, highlights, clips, entities (NER), embeddings (VECTOR(768)).
- Exports/sync targets, feedback, metrics, immutable audit_log.

## Public API (REST /v1)
- Auth/Users: login, refresh, me.
- Projects/Videos: create video (upload/url) → process steps; get video snapshot; delete.
- Transcripts/Chapters: get transcript; list chapters/segments; upsert chapter titles.
- Summaries/Highlights/Clips: request summaries; create highlights; render clips; list clips.
- Search/Entities: semantic search within a video; list entities.
- Exports/Sync: generate SRT/VTT/MD/PDF/JSON/YouTube-chapters; push to Notion/GDocs/YouTube.
- Conventions: Idempotency-Key; Problem+JSON errors; cursor pagination; rate limits.

## Pipelines
1) **Ingest**: upload/fetch → ffprobe → store → enqueue ASR.  
2) **ASR & Diarization**: WhisperX with word-timings; optional diar labels; punctuation/cleanup.  
3) **Segmentation**: scenes + semantic boundaries → stable chapters with LLM titles.  
4) **Summarization & Quotes**: exec bullets, outline, per-chapter abstracts; quotes with timestamps; hallucination checks referencing spans.  
5) **Highlights & Clips**: rank spans (KeyBERT + signals) → ffmpeg render (burned captions, aspect presets) → thumbnails.  
6) **Search & Entities**: SBERT sentence embeddings into pgvector; spaCy entities.  
7) **Exports & Sync**: SRT/VTT/PDF/MD/JSON; push chapters/descriptions to YouTube; Notion/GDocs pages.

## Frontend (Next.js)
- Pages: dashboard • projects • new video • video workspace (/videos/[id]) • exports • integrations • search.
- Workspace: Player with chapter bar • Transcript with search/jump • Summary/Highlights panel; edit & approve flows.
- Realtime: WS for status/tokens; SSE fallback.
- State: TanStack Query + Zustand; URL-synced filters; optimistic edits.

## DevOps & SLOs
- CI/CD: GitHub Actions (lint/typecheck/test, Docker, scan, sign, deploy).
- IaC: Terraform for DB/Redis/NATS/buckets/CDN/secrets/DNS; GPU node pool for ASR/clip render.
- Envs: dev/staging/prod; regional GPU optional; blue/green deploys.
- SLOs: RTF ≤ 0.6× GPU; first chapters < 90 s p95; clip render p95 < 25 s; 5xx < 0.5%/1k.
