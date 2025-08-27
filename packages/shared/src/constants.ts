// Created automatically by Cursor AI (2024-12-19)

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const MAX_FILE_SIZE = {
  FREE: 100 * 1024 * 1024, // 100MB
  PRO: 1024 * 1024 * 1024, // 1GB
  ENTERPRISE: 10 * 1024 * 1024 * 1024, // 10GB
};

export const MAX_VIDEO_DURATION = {
  FREE: 60 * 60, // 1 hour
  PRO: 4 * 60 * 60, // 4 hours
  ENTERPRISE: 24 * 60 * 60, // 24 hours
};

export const SUPPORTED_VIDEO_FORMATS = [
  'mp4',
  'avi',
  'mov',
  'mkv',
  'webm',
  'flv',
  'wmv',
  'm4v',
  '3gp',
];

export const SUPPORTED_AUDIO_FORMATS = [
  'mp3',
  'wav',
  'aac',
  'ogg',
  'flac',
  'm4a',
];

export const PROCESSING_STEPS = [
  'probe',
  'asr',
  'diarization',
  'segmentation',
  'summarization',
  'highlights',
  'clips',
] as const;

export const CLIP_ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;

export const EXPORT_FORMATS = ['srt', 'vtt', 'md', 'pdf', 'json'] as const;

export const EXPORT_TYPES = ['transcript', 'chapters', 'summary', 'highlights'] as const;

export const SUMMARY_TYPES = ['executive', 'outline', 'abstract', 'faq'] as const;

export const USER_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

export const PLANS = ['free', 'pro', 'enterprise'] as const;

export const VIDEO_STATUSES = ['uploading', 'processing', 'ready', 'failed', 'deleted'] as const;

export const CLIP_STATUSES = ['pending', 'rendering', 'ready', 'failed'] as const;

export const EXPORT_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const;

export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const RATE_LIMITS = {
  FREE: {
    UPLOADS_PER_HOUR: 5,
    PROCESSING_PER_HOUR: 10,
    EXPORTS_PER_HOUR: 20,
  },
  PRO: {
    UPLOADS_PER_HOUR: 50,
    PROCESSING_PER_HOUR: 100,
    EXPORTS_PER_HOUR: 200,
  },
  ENTERPRISE: {
    UPLOADS_PER_HOUR: 500,
    PROCESSING_PER_HOUR: 1000,
    EXPORTS_PER_HOUR: 2000,
  },
};

export const CACHE_TTL = {
  VIDEO_METADATA: 60 * 60, // 1 hour
  TRANSCRIPT: 24 * 60 * 60, // 24 hours
  CHAPTERS: 24 * 60 * 60, // 24 hours
  SUMMARIES: 24 * 60 * 60, // 24 hours
  HIGHLIGHTS: 24 * 60 * 60, // 24 hours
  CLIPS: 7 * 24 * 60 * 60, // 7 days
  EXPORTS: 7 * 24 * 60 * 60, // 7 days
};

export const JWT_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
};

export const SESSION_EXPIRY = 24 * 60 * 60; // 24 hours

export const UPLOAD_EXPIRY = 60 * 60; // 1 hour

export const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour
