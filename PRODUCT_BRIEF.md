# AI‑POWERED VIDEO SUMMARIZER — END‑TO‑END PRODUCT BLUEPRINT

*(React 18 + Next.js 14 App Router; **shadcn/ui** + Tailwind for UI; TypeScript‑first contracts; Node/NestJS API gateway; Python media/NLP workers (ffmpeg, WhisperX, pyannote optional, PySceneDetect, spaCy, Sentence‑BERT, KeyBERT); Postgres 16 + pgvector; Redis; S3/R2 for assets; NATS event bus; optional ClickHouse for analytics; multi‑tenant; seats + usage‑based billing.)*

---

## 1) Product Description & Presentation

**One‑liner**
“Drop a video or paste a link — get chapters, highlight clips, searchable transcript, and crisp summaries with citations and timestamps.”

**What it produces**

* **Transcript** with word‑level timestamps, speakers (optional), language detection, and confidence.
* **Chapters & topics** with titles, time ranges, and autoplay markers.
* **Summaries**: executive bullet summary, detailed outline, per‑chapter abstracts, key quotes with timestamps.
* **Highlights**: auto‑cut short clips (MP4/WebM) with burned‑in captions and thumbnails.
* **Exports**: SRT/VTT, TXT/MD/HTML, PDF report, JSON bundle, YouTube chapter list, Notion/Docs pushes.

**Scope/Safety**

* For rights‑permitted content only; verifies ownership or allowed public URLs.
* Disclaims that summaries may omit nuance; provides links/timestamps for verification.
* PII and sensitive content masking available for enterprise tenants.

---

## 2) Target User

* Creators, marketers, podcasters, educators, and teams summarizing long‑form video (webinars, lectures, interviews).
* Support/enablement teams building knowledge from demos and training recordings.
* Journalists and researchers extracting quotes and key segments.

---

## 3) Features & Functionalities (Extensive)

### Ingestion & Sources

* **Upload** large files with chunked/resumable (tus/Multipart) and checksum verification.
* **Links**: YouTube/Vimeo, Google Drive/Dropbox, Zoom cloud recording, direct MP4/MKV/WEBM URL.
* **Probe**: ffprobe metadata (duration, streams, fps, resolution, codecs) and loudness profile.

### Transcription & Diarization

* **ASR**: WhisperX (GPU when available) → word timings + confidence; language auto‑detect; CPU fallback.
* **Diarization (optional)**: pyannote or spectral clustering to label speakers; merges with transcript.
* **Cleanup**: punctuation, casing, filler removal (configurable), profanity mask toggle.

### Segmentation & Topics

* **Shot/scene detection** with PySceneDetect (content/adaptive).
* **Text segmentation**: TextTiling/semantic cosine (Sentence‑BERT) with backtracking for stable chapter boundaries.
* **Chapter titling**: LLM names each chapter; alternative “key topics” list.
* **Slide/OCR (optional)**: detect slide frames and OCR text to enrich topics.

### Summarization & Quotes

* **Executive summary** (5–10 bullets) and **detailed outline** (H2/H3).
* **Per‑chapter abstracts** and action points; **key quotes** with timestamps; **FAQ/Q\&A** generation.
* **Reading level/tone** controls; compression ratio guardrails; hallucination check that references transcript spans.

### Highlights & Clips

* **Highlight ranker** combines importance (TF‑IDF/KeyBERT), sentiment/emphasis spikes, scene boundaries, pauses/applause, and viewer heuristics.
* **Clip builder**: trims with handles/snapping to silence; burned captions; safe margins; aspect presets (16:9, 9:16, 1:1).
* **Thumbnailer**: picks representative frames; overlay title; brand color templates.

### Search & Navigation

* **Semantic search** over transcript with pgvector; returns timestamped spans and jump‑to playback.
* **Entity extraction** (people, orgs, products) and keyword tags.
* **Bookmarks & notes** tied to timecodes; shareable deep links.

### Collaboration & Governance

* Roles: Owner, Admin, Editor, Viewer; project workspaces.
* Comments and suggestions anchored to timecodes or transcript ranges.
* Versioning of summaries/highlights; approvals before publish.
* Consent banners and redaction for guest uploads.

### Integrations

* **Destinations**: YouTube (chapters/description), Notion/Confluence/Google Docs, Slack/Teams share, Drive/Dropbox.
* **Webhooks** for clip publish; Zapier/Make connectors.
* **Calendars**: ICS for publishing schedule of clips.

### Analytics & Costing

* **Quality**: proxy WER on curated dev set; coverage score (% of chapters referenced in summary).
* **Usage/cost**: GPU minutes, tokens, clip render time; tenant breakdown.
* **Engagement** (optional): click‑through on shared clips, time to first view.

---

## 4) Backend Architecture (Extremely Detailed & Deployment‑Ready)

### 4.1 Topology

* **Frontend/BFF:** Next.js 14 (Vercel). Server Actions for presigned uploads and light mutations; SSR for viewer/editor.
* **API Gateway:** **NestJS (Node 20)** — REST `/v1` (OpenAPI 3.1), Zod validation, Problem+JSON, RBAC (Casbin), RLS, rate limits, Idempotency‑Key, Request‑ID (ULID).
* **Workers (Python 3.11 + FastAPI control):**
  `probe-worker` (ffprobe), `asr-worker` (WhisperX), `diar-worker` (pyannote), `segment-worker` (scene/text segmentation), `ocr-worker` (slides), `summarize-worker` (LLM), `quote-worker` (key spans), `highlight-worker` (rank + select), `clip-worker` (ffmpeg render), `export-worker` (SRT/VTT/PDF/MD/JSON), `sync-worker` (YouTube/Notion/Docs), `search-worker` (embeddings/index), `quality-worker` (metrics).
* **Event Bus/Queues:** NATS (subjects: `media.ingest`, `media.asr`, `media.diar`, `media.segment`, `media.summarize`, `media.highlight`, `media.clip`, `export.*`, `sync.*`) + Redis Streams; Celery/RQ orchestration.
* **Datastores:** Postgres 16 + pgvector; S3/R2 for originals/captions/clips/exports; Redis for cache/session; optional ClickHouse for events.
* **Observability:** OpenTelemetry traces/logs/metrics; Prometheus/Grafana; Sentry.
* **Secrets:** Cloud Secrets Manager/KMS.

### 4.2 Data Model (Postgres + pgvector)

```sql
-- Tenancy & Identity
CREATE TABLE orgs (id UUID PRIMARY KEY, name TEXT NOT NULL, plan TEXT DEFAULT 'pro', region TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE users (id UUID PRIMARY KEY, org_id UUID REFERENCES orgs(id) ON DELETE CASCADE, email CITEXT UNIQUE NOT NULL, name TEXT, role TEXT DEFAULT 'editor', tz TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE memberships (user_id UUID, org_id UUID, role TEXT CHECK (role IN ('owner','admin','editor','viewer')), PRIMARY KEY (user_id, org_id));

-- Projects & Videos
CREATE TABLE projects (id UUID PRIMARY KEY, org_id UUID, name TEXT, description TEXT, created_by UUID, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE videos (
  id UUID PRIMARY KEY, org_id UUID, project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT, source TEXT, url TEXT, s3_key TEXT, duration_sec INT, fps NUMERIC, width INT, height INT,
  lang TEXT, status TEXT CHECK (status IN ('uploaded','processing','ready','failed','archived')) DEFAULT 'uploaded',
  meta JSONB, created_by UUID, created_at TIMESTAMPTZ DEFAULT now()
);

-- Transcripts & Speakers
CREATE TABLE transcripts (
  id UUID PRIMARY KEY, video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  text TEXT, words JSONB, -- [{w,start_ms,end_ms,conf,speaker?}]
  diarization JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE speakers (
  id UUID PRIMARY KEY, video_id UUID, label TEXT, name TEXT, color TEXT
);

-- Segments & Chapters
CREATE TABLE segments (
  id UUID PRIMARY KEY, video_id UUID, start_ms INT, end_ms INT, kind TEXT CHECK (kind IN ('scene','topic','slide')),
  title TEXT, ocr TEXT, meta JSONB
);
CREATE TABLE chapters (
  id UUID PRIMARY KEY, video_id UUID, start_ms INT, end_ms INT, title TEXT, order_idx INT, meta JSONB
);

-- Summaries & Quotes
CREATE TABLE summaries (
  id UUID PRIMARY KEY, video_id UUID, scope TEXT CHECK (scope IN ('video','chapter','segment')),
  ref_id UUID, kind TEXT CHECK (kind IN ('exec','outline','abstract','faq')), text_md TEXT, compression NUMERIC, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE quotes (
  id UUID PRIMARY KEY, video_id UUID, start_ms INT, end_ms INT, text TEXT, speaker TEXT, confidence NUMERIC
);

-- Highlights & Clips
CREATE TABLE highlights (
  id UUID PRIMARY KEY, video_id UUID, start_ms INT, end_ms INT, score NUMERIC, reason JSONB, thumb_s3_key TEXT
);
CREATE TABLE clips (
  id UUID PRIMARY KEY, video_id UUID, highlight_id UUID, s3_key TEXT, format TEXT, width INT, height INT, duration_ms INT, captions_s3_key TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

-- Search & Entities
CREATE TABLE entities (
  id UUID PRIMARY KEY, video_id UUID, kind TEXT, value TEXT, start_ms INT, end_ms INT, normalized JSONB
);
CREATE TABLE embeddings (
  id UUID PRIMARY KEY, video_id UUID, owner_kind TEXT, owner_id UUID, text TEXT, embedding VECTOR(768), meta JSONB
);
CREATE INDEX embeddings_idx ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Exports & Sync
CREATE TABLE exports (
  id UUID PRIMARY KEY, video_id UUID, kind TEXT, s3_key TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE sync_targets (
  id UUID PRIMARY KEY, org_id UUID, kind TEXT, config JSONB, enabled BOOLEAN DEFAULT TRUE
);

-- Feedback & Analytics
CREATE TABLE feedback (
  id UUID PRIMARY KEY, video_id UUID, user_id UUID, target TEXT, value INT CHECK (value IN (-1,1)), reason TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE metrics (
  id BIGSERIAL PRIMARY KEY, org_id UUID, video_id UUID, metric_date DATE, wer NUMERIC, coverage NUMERIC, tokens BIGINT, cost_usd NUMERIC
);

-- Audit
CREATE TABLE audit_log (id BIGSERIAL PRIMARY KEY, org_id UUID, user_id UUID, action TEXT, target TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now());
```

**Invariants**

* RLS by `org_id`; per‑project isolation.
* `chapters` non‑overlapping with dense ordering; `segments` may overlap across kinds.
* `summaries` reference existing `video|chapter|segment`; `clips` must map to `highlights`.
* Exports require `videos.status='ready'`.

### 4.3 API Surface (REST `/v1`, OpenAPI)

**Auth/Orgs/Users**

* `POST /auth/login`, `POST /auth/refresh`, `GET /me`.

**Projects & Videos**

* `POST /projects` `{name, description}`
* `POST /videos` `{project_id?, title?, source:'upload'|'url', url?}` → presigned upload if needed
* `POST /videos/:id/process` `{steps?:['asr','diar','segment','summarize','highlight','clip']}`
* `GET /videos/:id` snapshot
* `DELETE /videos/:id`

**Transcripts & Chapters**

* `GET /videos/:id/transcript`
* `GET /videos/:id/chapters|segments`
* `POST /videos/:id/chapters` `{upserts:[{start_ms,end_ms,title}]}`

**Summaries & Highlights**

* `POST /videos/:id/summaries` `{scopes:['video'|'chapter'], kinds:['exec','outline','abstract','faq'], tone?, length?}`
* `POST /videos/:id/highlights` `{target:'video'|'chapter', count?:5, aspect?:'16:9'|'9:16'|'1:1'}`
* `POST /videos/:id/clips` `{highlight_ids:[...]}`
* `GET /videos/:id/highlights|clips`

**Search & Entities**

* `POST /search` `{video_id, q, k?, semantic?:true}`
* `GET /videos/:id/entities`

**Exports & Sync**

* `POST /exports` `{video_id, kind:'srt'|'vtt'|'pdf'|'md'|'json'|'yt_chapters'}` → signed URL
* `POST /sync` `{video_id, target:'notion'|'gdocs'|'confluence'|'youtube'}`

**Conventions**

* Mutations require Idempotency‑Key; Problem+JSON errors; cursor pagination; rate limits.

### 4.4 Pipelines & Workers

**Ingest**

1. Upload/URL fetch → `probe-worker` extracts metadata → store to S3 → enqueue ASR.
   **ASR & Diar**
2. `asr-worker` transcribes; `diar-worker` labels speakers (if enabled); merge and persist `transcripts`.
   **Segment**
3. `segment-worker` computes scene/semantic segments; slide OCR enriches; chapters selected with backtracking; write `segments/chapters`.
   **Summarize**
4. `summarize-worker` creates exec/outline/abstract/FAQ; compression and hallucination checks; reference spans.
   **Highlights & Clips**
5. `highlight-worker` ranks spans; `clip-worker` renders MP4/WebM with captions and thumbnails; upload to S3.
   **Search & Entities**
6. Build embeddings for transcript sentences/chapters; extract entities; populate `embeddings/entities`.
   **Export/Sync**
7. Render SRT/VTT/PDF/MD/JSON; push to Notion/Docs/YouTube chapters; write `exports`.

### 4.5 Realtime

* WebSocket channels: `video:{id}:status`, `video:{id}:tokens`, `clip:{id}:progress`.
* SSE streaming for tokenized summary text and ASR partials during live preview.

### 4.6 Caching & Performance

* Redis: presigned URLs, recent embeddings, chapter cache, export manifests.
* GPU pool autoscaling for ASR/clip render; CPU fallbacks.
* Chunked transcript processing to keep latency low; parallel chapter summarization.

### 4.7 Observability

* OTel spans across `probe`, `asr`, `diar`, `segment`, `summarize`, `highlight`, `clip`, `export`, `sync`.
* Metrics: ASR real‑time factor, chapter boundary stability, summary compression ratio, clip render p95, token/cost per minute.
* Alerts: ASR failures, render timeouts, sync errors.

### 4.8 Security & Compliance

* TLS/HSTS/CSP; signed URLs; KMS‑encrypted secrets; tenant isolation via RLS and S3 prefixes.
* Content rights acknowledgment; takedown flow.
* DSR endpoints; retention policies; SSO/SAML/OIDC; SCIM for enterprise.

---

## 5) Frontend Architecture (React 18 + Next.js 14)

### 5.1 Tech Choices

* **UI:** shadcn/ui (Dialog, Drawer, Tabs, Table, Dropdown, Tooltip, Progress, Toast) + Tailwind.
* **Player:** video.js or ReactPlayer with caption tracks and chapter markers.
* **Editor:** TipTap for summary editing; markdown preview.
* **State/Data:** TanStack Query; Zustand for player/editor panels; URL‑synced filters.
* **Realtime:** WS client; SSE for token streams.
* **i18n/A11y:** next‑intl; keyboard shortcuts; ARIA for timelines and captions.

### 5.2 App Structure

```
/app
  /(marketing)/page.tsx
  /(auth)/sign-in/page.tsx
  /(app)/dashboard/page.tsx
  /(app)/projects/page.tsx
  /(app)/videos/new/page.tsx
  /(app)/videos/[videoId]/page.tsx
  /(app)/exports/page.tsx
  /(app)/integrations/page.tsx
  /(app)/search/page.tsx
/components
  Upload/*            // DropZone, UrlInput, ProgressBar
  Player/*            // VideoPlayer, ChapterBar, CaptionTrack
  Transcript/*        // WordStream, Search, JumpList
  Chapters/*          // ChapterList, Editor
  Summary/*           // ExecBullets, Outline, FAQ
  Highlights/*        // Timeline, ClipCard, RenderQueue
  Entities/*          // Tags, People, Orgs
  ExportPanel/*
  Integrations/*
  Comments/*
/lib
  api-client.ts
  ws-client.ts
  zod-schemas.ts
  rbac.ts
/store
  usePlayerStore.ts
  useEditorStore.ts
  useUploadStore.ts
  useRealtimeStore.ts
```

### 5.3 Key Pages & UX Flows

**New Video**

* Upload file or paste URL → show probe metadata → pick language, diarization, and output types → start processing; live status.

**Video Workspace**

* Three‑pane: Player (with chapter markers), Transcript (search + click‑to‑jump), and Summary panel.
* Edit chapter titles; accept/adjust summaries; generate highlights; render clips with aspect presets; copy YouTube chapters.

**Search**

* Semantic search across transcripts; results show preview snippets; click → jump to timecode.

**Exports**

* Pick outputs (SRT/VTT, MD/PDF, JSON, chapters) → generate → signed links; push to Notion/Docs/YouTube.

**Integrations**

* Connect Notion/Google/YouTube; set defaults (destination DB/page, YouTube description template).

### 5.4 Component Breakdown (Selected)

* **Player/ChapterBar.tsx**
  Props: `{ chapters, currentTime, onSeek }`
  Renders markers with tooltips; keyboard navigation; snap‑to chapter boundaries.

* **Transcript/WordStream.tsx**
  Props: `{ words, onSelect }`
  Streams words with confidence shading; selection yields start/end for quotes/highlights.

* **Highlights/Timeline.tsx**
  Props: `{ scenes, candidates, onCreate }`
  Shows ranked spans; drag handles; ensures silence‑aligned cut points.

* **Summary/ExecBullets.tsx**
  Props: `{ bullets, onEdit }`
  Enforces bullet length/tone; shows references to transcript spans.

### 5.5 Data Fetching & Caching

* Server Components for project/video snapshots.
* Query caching on transcripts/chapters; streaming writes for ASR tokens; optimistic edits for titles/summaries.
* Prefetch: videos → transcript → chapters → highlights.

### 5.6 Validation & Error Handling

* Zod schemas; Problem+JSON renderer (unsupported codec, too long, quota exceeded).
* Guards: clip render blocked if highlight > max duration; summary requires transcript ready; chapter overlaps prevented.

### 5.7 Accessibility & i18n

* Full keyboard controls for player/seek; caption track compliant with WCAG; high‑contrast; localized dates/numbers; RTL support.

---

## 6) SDKs & Integration Contracts

**Create Video & Process**

```http
POST /v1/videos {"title":"KubeConf Keynote","source":"url","url":"https://youtu.be/abc"}
POST /v1/videos/{id}/process {"steps":["asr","segment","summarize","highlight"]}
```

**Get Chapters & Summaries**

```http
GET /v1/videos/{id}/chapters
GET /v1/videos/{id}/summaries?scope=video
```

**Export**

```http
POST /v1/exports {"video_id":"vid_123","kind":"pdf"}
```

**JSON Bundle** keys: `video`, `transcript`, `chapters[]`, `segments[]`, `summaries[]`, `quotes[]`, `highlights[]`, `clips[]`, `entities[]`, `exports[]`.

---

## 7) DevOps & Deployment

* **FE:** Vercel (Next.js).
* **APIs/Workers:** Render/Fly/GKE; GPU pool for ASR/clip render; autoscaling on queue depth; CPU fallbacks.
* **DB:** Managed Postgres + pgvector; PITR; replicas.
* **Cache/Bus:** Redis + NATS; DLQ with retries/backoff/jitter.
* **Storage:** S3/R2 with lifecycle; CDN for clip/thumbnail delivery.
* **CI/CD:** GitHub Actions (lint/typecheck/unit/integration, Docker, scan, sign, deploy); blue/green; migration approvals.
* **IaC:** Terraform modules for DB/Redis/NATS/buckets/CDN/secrets/DNS.
* **Envs:** dev/staging/prod; regional GPU nodes optional; error budgets/alerts.

**Operational SLOs**

* ASR real‑time factor **≤ 0.6×** on GPU (60‑min video → ≤ 36‑min) / **≤ 1.5×** CPU.
* First chapters visible **< 90 s p95** on 60‑min video (progressive).
* Clip render p95 **< 25 s** for 30‑sec highlight with burned captions.
* 5xx **< 0.5%/1k**.

---

## 8) Testing

* **Unit:** alignment merges, segmentation stability, title generator length, highlight ranker scoring, clip safety margins.
* **Integration:** ingest → ASR → segment → summarize → highlight → clip → export → sync to YouTube/Notion.
* **Regression:** WER proxy ceiling; coverage score guardrails; Latin/non‑Latin script handling; diarization edge cases.
* **E2E (Playwright):** paste YouTube URL → process → edit chapter title → generate highlights → export PDF & SRT → push chapters to YouTube.
* **Load:** concurrent 30‑ to 90‑min video processing; long‑running job recovery.
* **Chaos:** GPU node kill; ffmpeg failure; partial upload; ensure retries and resumable processing.
* **Security:** RLS coverage; signed URL expiry; rights verification workflow.

---

## 9) Success Criteria

**Product KPIs**

* Time saved per hour of video: **≥ 30 min** median (survey).
* Summary helpfulness thumbs‑up **≥ 80%** across tenants.
* Clip export usage on processed videos **≥ 60%**.
* Notion/Docs/YouTube sync success **≥ 99%**.

**Engineering SLOs**

* Pipeline success **≥ 99%** excl. provider outages; ASR error budget respected; clip render queue drain within SLA.

---

## 10) Visual/Logical Flows

**A) Ingest → ASR**
User uploads or pastes URL → probe metadata → ASR tokens stream; partial transcript visible.

**B) Segment → Chapters**
Scene + semantic segmentation → chapter boundaries chosen and titled → displayed on timeline.

**C) Summarize & Quotes**
Generate exec bullets and outline → extract quotes with timestamps → user edits and approves.

**D) Highlights → Clips**
Rank highlight candidates → pick top spans → render clips with captions and thumbnails.

**E) Export & Sync**
Export SRT/VTT/PDF/MD/JSON → push to Notion/Docs/YouTube chapters → share links.
