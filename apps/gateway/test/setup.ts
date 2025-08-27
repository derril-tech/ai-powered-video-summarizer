// Created automatically by Cursor AI (2024-12-19)
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

// Mock external dependencies
jest.mock('nats', () => ({
  connect: jest.fn().mockResolvedValue({
    publish: jest.fn(),
    subscribe: jest.fn(),
    request: jest.fn(),
    drain: jest.fn(),
    close: jest.fn(),
  }),
}));

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    xAdd: jest.fn(),
    xRead: jest.fn(),
  }),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-presigned-url.com'),
}));

// Global test configuration
export const createTestingModule = async (imports: any[] = []) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      ...imports,
    ],
  });
};

// Test utilities
export const mockUser = {
  id: 'test-user-id',
  orgId: 'test-org-id',
  email: 'test@example.com',
  role: 'user',
};

export const mockVideo = {
  id: 'test-video-id',
  title: 'Test Video',
  description: 'Test video description',
  duration: 3600,
  status: 'processing',
  orgId: 'test-org-id',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTranscript = {
  id: 'test-transcript-id',
  videoId: 'test-video-id',
  segments: [
    {
      id: 'segment-1',
      start: 0,
      end: 10,
      text: 'Hello, this is a test segment.',
      speaker: 'Speaker 1',
      confidence: 0.95,
    },
  ],
  wordLevel: [
    {
      word: 'Hello',
      start: 0,
      end: 0.5,
      confidence: 0.98,
    },
  ],
  createdAt: new Date(),
};

export const mockSummary = {
  id: 'test-summary-id',
  videoId: 'test-video-id',
  type: 'executive',
  content: 'This is a test summary of the video content.',
  chapters: [
    {
      id: 'chapter-1',
      title: 'Introduction',
      start: 0,
      end: 300,
      summary: 'Introduction to the topic.',
    },
  ],
  createdAt: new Date(),
};

// Mock database operations
export const mockDatabase = {
  videos: {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transcripts: {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  summaries: {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  highlights: {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Mock file operations
export const mockFileService = {
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  generatePresignedUrl: jest.fn(),
  getFileMetadata: jest.fn(),
};

// Mock job service
export const mockJobService = {
  publishJob: jest.fn(),
  publishVideoJob: jest.fn(),
  handleJobResult: jest.fn(),
  handleJobError: jest.fn(),
  startVideoProcessing: jest.fn(),
};

// Mock realtime service
export const mockRealtimeService = {
  addClient: jest.fn(),
  removeClient: jest.fn(),
  broadcastToVideo: jest.fn(),
  broadcastToOrg: jest.fn(),
  sendToUser: jest.fn(),
};

// Test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.NATS_URL = 'nats://localhost:4222';
  process.env.S3_BUCKET = 'test-bucket';
  process.env.JWT_SECRET = 'test-jwt-secret';
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Cleanup test environment
});
