// Created automatically by Cursor AI (2024-12-19)

import { z } from 'zod';

export const VideoStatusSchema = z.enum(['uploading', 'processing', 'ready', 'failed', 'deleted']);
export const SummaryTypeSchema = z.enum(['executive', 'outline', 'abstract', 'faq']);
export const AspectRatioSchema = z.enum(['16:9', '9:16', '1:1']);
export const ClipStatusSchema = z.enum(['pending', 'rendering', 'ready', 'failed']);
export const ExportTypeSchema = z.enum(['transcript', 'chapters', 'summary', 'highlights']);
export const ExportFormatSchema = z.enum(['srt', 'vtt', 'md', 'pdf', 'json']);
export const ExportStatusSchema = z.enum(['pending', 'processing', 'ready', 'failed']);
export const PlanSchema = z.enum(['free', 'pro', 'enterprise']);
export const UserRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);

export const VideoMetadataSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  fps: z.number().positive(),
  bitrate: z.number().positive(),
  codec: z.string(),
  audioCodec: z.string().optional(),
  audioChannels: z.number().positive().optional(),
  audioSampleRate: z.number().positive().optional(),
});

export const VideoSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional(),
  duration: z.number().positive(),
  size: z.number().positive(),
  format: z.string(),
  status: VideoStatusSchema,
  metadata: VideoMetadataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TranscriptWordSchema = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  speaker: z.string().optional(),
});

export const SpeakerSegmentSchema = z.object({
  speaker: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

export const TranscriptSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  words: z.array(TranscriptWordSchema),
  speakers: z.array(SpeakerSegmentSchema).optional(),
  confidence: z.number().min(0).max(1),
  language: z.string().length(2),
  createdAt: z.date(),
});

export const ChapterSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  title: z.string().min(1).max(255),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SummarySchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  type: SummaryTypeSchema,
  content: z.string(),
  confidence: z.number().min(0).max(1),
  createdAt: z.date(),
});

export const HighlightSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  score: z.number().min(0).max(1),
  tags: z.array(z.string()),
  createdAt: z.date(),
});

export const ClipSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  highlightId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  aspectRatio: AspectRatioSchema,
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
  status: ClipStatusSchema,
  createdAt: z.date(),
});

export const ExportSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  type: ExportTypeSchema,
  format: ExportFormatSchema,
  url: z.string().url(),
  status: ExportStatusSchema,
  createdAt: z.date(),
});

export const OrganizationSettingsSchema = z.object({
  maxVideoDuration: z.number().positive(),
  maxVideoSize: z.number().positive(),
  allowedDomains: z.array(z.string()),
  piiMasking: z.boolean(),
  profanityFilter: z.boolean(),
});

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  plan: PlanSchema,
  settings: OrganizationSettingsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Request/Response schemas
export const CreateVideoRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional(),
  projectId: z.string().uuid().optional(),
});

export const ProcessVideoRequestSchema = z.object({
  steps: z.array(z.enum(['probe', 'asr', 'diarization', 'segmentation', 'summarization', 'highlights', 'clips'])),
});

export const CreateHighlightRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  tags: z.array(z.string()).optional(),
});

export const CreateClipRequestSchema = z.object({
  highlightId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  aspectRatio: AspectRatioSchema,
});

export const ExportRequestSchema = z.object({
  type: ExportTypeSchema,
  format: ExportFormatSchema,
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  videoId: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(10),
});
