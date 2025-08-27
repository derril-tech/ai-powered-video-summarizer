// Created automatically by Cursor AI (2024-12-19)

export interface Video {
  id: string;
  orgId: string;
  projectId?: string;
  title: string;
  description?: string;
  url?: string;
  duration: number;
  size: number;
  format: string;
  status: VideoStatus;
  metadata: VideoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
}

export type VideoStatus = 
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'deleted';

export interface Transcript {
  id: string;
  videoId: string;
  words: TranscriptWord[];
  speakers?: SpeakerSegment[];
  confidence: number;
  language: string;
  createdAt: Date;
}

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface SpeakerSegment {
  speaker: string;
  start: number;
  end: number;
}

export interface Chapter {
  id: string;
  videoId: string;
  title: string;
  start: number;
  end: number;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Summary {
  id: string;
  videoId: string;
  type: SummaryType;
  content: string;
  confidence: number;
  createdAt: Date;
}

export type SummaryType = 
  | 'executive'
  | 'outline'
  | 'abstract'
  | 'faq';

export interface Highlight {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  start: number;
  end: number;
  score: number;
  tags: string[];
  createdAt: Date;
}

export interface Clip {
  id: string;
  videoId: string;
  highlightId?: string;
  title: string;
  start: number;
  end: number;
  aspectRatio: AspectRatio;
  url: string;
  thumbnailUrl: string;
  status: ClipStatus;
  createdAt: Date;
}

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type ClipStatus = 
  | 'pending'
  | 'rendering'
  | 'ready'
  | 'failed';

export interface Export {
  id: string;
  videoId: string;
  type: ExportType;
  format: ExportFormat;
  url: string;
  status: ExportStatus;
  createdAt: Date;
}

export type ExportType = 
  | 'transcript'
  | 'chapters'
  | 'summary'
  | 'highlights';

export type ExportFormat = 
  | 'srt'
  | 'vtt'
  | 'md'
  | 'pdf'
  | 'json';

export type ExportStatus = 
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type Plan = 'free' | 'pro' | 'enterprise';

export interface OrganizationSettings {
  maxVideoDuration: number;
  maxVideoSize: number;
  allowedDomains: string[];
  piiMasking: boolean;
  profanityFilter: boolean;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
