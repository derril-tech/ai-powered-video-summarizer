// Created automatically by Cursor AI (2024-12-19)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideosModule } from '../../src/videos/videos.module';
import { JobsModule } from '../../src/jobs/jobs.module';
import { NatsModule } from '../../src/nats/nats.module';
import { DatabaseModule } from '../../src/database/database.module';
import { FileModule } from '../../src/file/file.module';
import { RealtimeModule } from '../../src/realtime/realtime.module';
import { VideosService } from '../../src/videos/videos.service';
import { JobsService } from '../../src/jobs/jobs.service';
import { DatabaseService } from '../../src/database/database.service';
import { FileService } from '../../src/file/file.service';
import { NatsService } from '../../src/nats/nats.service';
import { RealtimeService } from '../../src/realtime/realtime.service';
import { mockUser } from '../setup';

describe('Video Processing Integration', () => {
  let app: INestApplication;
  let videosService: VideosService;
  let jobsService: JobsService;
  let databaseService: DatabaseService;
  let fileService: FileService;
  let natsService: NatsService;
  let realtimeService: RealtimeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        VideosModule,
        JobsModule,
        NatsModule,
        DatabaseModule,
        FileModule,
        RealtimeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    videosService = moduleFixture.get<VideosService>(VideosService);
    jobsService = moduleFixture.get<JobsService>(JobsService);
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    fileService = moduleFixture.get<FileService>(FileService);
    natsService = moduleFixture.get<NatsService>(NatsService);
    realtimeService = moduleFixture.get<RealtimeService>(RealtimeService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Video Processing Pipeline', () => {
    it('should process video from upload to completion', async () => {
      // Step 1: Create video record
      const createVideoDto = {
        title: 'Integration Test Video',
        description: 'Test video for integration testing',
        url: 'https://example.com/test-video.mp4',
      };

      const videoResult = await videosService.createVideo(createVideoDto, mockUser);
      expect(videoResult.video).toBeDefined();
      expect(videoResult.uploadUrl).toBeDefined();
      expect(videoResult.video.status).toBe('uploading');

      const videoId = videoResult.video.id;

      // Step 2: Start processing pipeline
      const processingSteps = ['probe', 'asr', 'diarization', 'segmentation', 'summarization', 'highlight'];
      const processResult = await videosService.processVideo(videoId, processingSteps, mockUser);
      
      expect(processResult.videoId).toBe(videoId);
      expect(processResult.status).toBe('processing');
      expect(processResult.jobIds).toHaveLength(processingSteps.length);

      // Step 3: Simulate job completion for each step
      for (let i = 0; i < processingSteps.length; i++) {
        const jobId = processResult.jobIds[i];
        const step = processingSteps[i];
        
        // Simulate job result
        const jobResult = {
          jobId,
          videoId,
          step,
          status: 'completed',
          data: generateMockJobData(step),
          timestamp: new Date().toISOString(),
        };

        await jobsService.handleJobResult(jobId, jobResult, videoId);
      }

      // Step 4: Verify final video state
      const finalVideo = await videosService.getVideo(videoId, mockUser);
      expect(finalVideo.status).toBe('completed');
      expect(finalVideo.transcript).toBeDefined();
      expect(finalVideo.summaries).toBeDefined();
      expect(finalVideo.highlights).toBeDefined();
      expect(finalVideo.chapters).toBeDefined();

      // Step 5: Verify transcript quality
      expect(finalVideo.transcript.segments).toHaveLength.greaterThan(0);
      expect(finalVideo.transcript.wordLevel).toHaveLength.greaterThan(0);
      
      // Check WER proxy (should be below threshold)
      const averageConfidence = finalVideo.transcript.wordLevel.reduce(
        (sum, word) => sum + word.confidence, 0
      ) / finalVideo.transcript.wordLevel.length;
      expect(averageConfidence).toBeGreaterThan(0.8);

      // Step 6: Verify summary quality
      expect(finalVideo.summaries).toHaveLength.greaterThan(0);
      const executiveSummary = finalVideo.summaries.find(s => s.type === 'executive');
      expect(executiveSummary).toBeDefined();
      expect(executiveSummary.content.length).toBeGreaterThan(50);

      // Step 7: Verify highlights quality
      expect(finalVideo.highlights).toHaveLength.greaterThan(0);
      finalVideo.highlights.forEach(highlight => {
        expect(highlight.title).toBeDefined();
        expect(highlight.start).toBeGreaterThanOrEqual(0);
        expect(highlight.end).toBeGreaterThan(highlight.start);
        expect(highlight.score).toBeGreaterThan(0.5);
      });

      // Step 8: Verify chapters quality
      expect(finalVideo.chapters).toHaveLength.greaterThan(0);
      finalVideo.chapters.forEach(chapter => {
        expect(chapter.title).toBeDefined();
        expect(chapter.start).toBeGreaterThanOrEqual(0);
        expect(chapter.end).toBeGreaterThan(chapter.start);
        expect(chapter.summary).toBeDefined();
      });

      // Step 9: Test export generation
      const exportResult = await videosService.generateExport(videoId, 'pdf', mockUser);
      expect(exportResult.exportId).toBeDefined();
      expect(exportResult.downloadUrl).toBeDefined();

      // Step 10: Verify search functionality
      const searchResults = await videosService.searchVideos(
        { query: 'integration test', limit: 10, offset: 0 },
        mockUser
      );
      expect(searchResults).toContainEqual(expect.objectContaining({ id: videoId }));
    }, 60000); // 60 second timeout for integration test

    it('should handle processing failures and retries', async () => {
      // Create video
      const createVideoDto = {
        title: 'Failure Test Video',
        description: 'Test video for failure scenarios',
        url: 'https://example.com/failure-test.mp4',
      };

      const videoResult = await videosService.createVideo(createVideoDto, mockUser);
      const videoId = videoResult.video.id;

      // Start processing
      const processResult = await videosService.processVideo(videoId, ['asr'], mockUser);
      const jobId = processResult.jobIds[0];

      // Simulate job failure
      const jobError = {
        jobId,
        videoId,
        step: 'asr',
        error: 'GPU timeout error',
        retries: 0,
        maxRetries: 3,
      };

      await jobsService.handleJobError(jobId, jobError.error, videoId, jobError.retries, jobError.maxRetries);

      // Verify error handling
      const videoStatus = await videosService.getVideoStatus(videoId, mockUser);
      expect(videoStatus.status).toBe('error');

      // Simulate retry
      const retryResult = await videosService.retryProcessing(videoId, ['asr'], mockUser);
      expect(retryResult.jobIds).toHaveLength(1);

      // Simulate successful retry
      const jobResult = {
        jobId: retryResult.jobIds[0],
        videoId,
        step: 'asr',
        status: 'completed',
        data: generateMockJobData('asr'),
        timestamp: new Date().toISOString(),
      };

      await jobsService.handleJobResult(jobResult.jobId, jobResult, videoId);

      // Verify recovery
      const finalStatus = await videosService.getVideoStatus(videoId, mockUser);
      expect(finalStatus.status).toBe('completed');
    }, 30000);

    it('should enforce organization isolation', async () => {
      // Create video for first organization
      const org1User = { ...mockUser, orgId: 'org-1', id: 'user-1' };
      const createVideoDto = {
        title: 'Org 1 Video',
        description: 'Video for organization 1',
        url: 'https://example.com/org1-video.mp4',
      };

      const videoResult1 = await videosService.createVideo(createVideoDto, org1User);
      const videoId1 = videoResult1.video.id;

      // Create video for second organization
      const org2User = { ...mockUser, orgId: 'org-2', id: 'user-2' };
      const videoResult2 = await videosService.createVideo(createVideoDto, org2User);
      const videoId2 = videoResult2.video.id;

      // Verify org1 user cannot access org2 video
      await expect(videosService.getVideo(videoId2, org1User)).rejects.toThrow('Video not found');

      // Verify org2 user cannot access org1 video
      await expect(videosService.getVideo(videoId1, org2User)).rejects.toThrow('Video not found');

      // Verify search results are isolated
      const org1Results = await videosService.searchVideos(
        { query: 'Org 1', limit: 10, offset: 0 },
        org1User
      );
      expect(org1Results).toHaveLength(1);
      expect(org1Results[0].id).toBe(videoId1);

      const org2Results = await videosService.searchVideos(
        { query: 'Org 1', limit: 10, offset: 0 },
        org2User
      );
      expect(org2Results).toHaveLength(0);
    });

    it('should handle concurrent video processing', async () => {
      const concurrentVideos = [];
      const promises = [];

      // Create multiple videos simultaneously
      for (let i = 0; i < 5; i++) {
        const createVideoDto = {
          title: `Concurrent Video ${i}`,
          description: `Concurrent test video ${i}`,
          url: `https://example.com/concurrent-${i}.mp4`,
        };

        promises.push(videosService.createVideo(createVideoDto, mockUser));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);

      // Start processing for all videos
      const processingPromises = results.map(result =>
        videosService.processVideo(result.video.id, ['asr'], mockUser)
      );

      const processingResults = await Promise.all(processingPromises);
      expect(processingResults).toHaveLength(5);

      // Verify all videos are in processing state
      for (const result of processingResults) {
        expect(result.status).toBe('processing');
      }
    }, 30000);
  });

  describe('Performance and Load Testing', () => {
    it('should handle large video files efficiently', async () => {
      const largeVideoDto = {
        title: 'Large Test Video',
        description: 'Large video file for performance testing',
        url: 'https://example.com/large-video.mp4',
        fileSize: 1024 * 1024 * 1024, // 1GB
        duration: 7200, // 2 hours
      };

      const startTime = Date.now();
      const videoResult = await videosService.createVideo(largeVideoDto, mockUser);
      const createTime = Date.now() - startTime;

      // Video creation should be fast (< 1 second)
      expect(createTime).toBeLessThan(1000);

      // Start processing
      const processStartTime = Date.now();
      const processResult = await videosService.processVideo(
        videoResult.video.id,
        ['probe', 'asr', 'summarization'],
        mockUser
      );
      const processTime = Date.now() - processStartTime;

      // Processing initiation should be fast (< 2 seconds)
      expect(processTime).toBeLessThan(2000);

      expect(processResult.jobIds).toHaveLength(3);
    });

    it('should maintain performance under load', async () => {
      const loadTestPromises = [];
      const startTime = Date.now();

      // Create 10 videos simultaneously
      for (let i = 0; i < 10; i++) {
        const createVideoDto = {
          title: `Load Test Video ${i}`,
          description: `Load test video ${i}`,
          url: `https://example.com/load-test-${i}.mp4`,
        };

        loadTestPromises.push(videosService.createVideo(createVideoDto, mockUser));
      }

      const results = await Promise.all(loadTestPromises);
      const totalTime = Date.now() - startTime;

      // All videos should be created within reasonable time (< 5 seconds)
      expect(totalTime).toBeLessThan(5000);
      expect(results).toHaveLength(10);

      // Verify all videos are accessible
      for (const result of results) {
        const video = await videosService.getVideo(result.video.id, mockUser);
        expect(video.id).toBe(result.video.id);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed video URLs', async () => {
      const malformedDto = {
        title: 'Malformed URL Video',
        description: 'Video with malformed URL',
        url: 'not-a-valid-url',
      };

      await expect(videosService.createVideo(malformedDto, mockUser)).rejects.toThrow();
    });

    it('should handle empty video titles', async () => {
      const emptyTitleDto = {
        title: '',
        description: 'Video with empty title',
        url: 'https://example.com/empty-title.mp4',
      };

      await expect(videosService.createVideo(emptyTitleDto, mockUser)).rejects.toThrow();
    });

    it('should handle extremely long video titles', async () => {
      const longTitleDto = {
        title: 'A'.repeat(1000), // Very long title
        description: 'Video with very long title',
        url: 'https://example.com/long-title.mp4',
      };

      await expect(videosService.createVideo(longTitleDto, mockUser)).rejects.toThrow();
    });

    it('should handle duplicate video processing requests', async () => {
      const createVideoDto = {
        title: 'Duplicate Processing Test',
        description: 'Test duplicate processing',
        url: 'https://example.com/duplicate-test.mp4',
      };

      const videoResult = await videosService.createVideo(createVideoDto, mockUser);
      const videoId = videoResult.video.id;

      // Start processing
      await videosService.processVideo(videoId, ['asr'], mockUser);

      // Try to start processing again
      await expect(videosService.processVideo(videoId, ['asr'], mockUser)).rejects.toThrow(
        'Video is already being processed'
      );
    });
  });
});

// Helper function to generate mock job data
function generateMockJobData(step: string) {
  switch (step) {
    case 'probe':
      return {
        duration: 3600,
        width: 1920,
        height: 1080,
        fps: 30,
        audioCodec: 'aac',
        videoCodec: 'h264',
      };
    case 'asr':
      return {
        segments: [
          {
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
      };
    case 'diarization':
      return {
        speakers: ['Speaker 1', 'Speaker 2'],
        segments: [
          {
            start: 0,
            end: 10,
            speaker: 'Speaker 1',
            confidence: 0.9,
          },
        ],
      };
    case 'segmentation':
      return {
        scenes: [
          {
            start: 0,
            end: 300,
            confidence: 0.85,
          },
        ],
        semanticSegments: [
          {
            start: 0,
            end: 600,
            topic: 'Introduction',
            confidence: 0.8,
          },
        ],
      };
    case 'summarization':
      return {
        executive: 'This is an executive summary of the video content.',
        chapters: [
          {
            title: 'Introduction',
            start: 0,
            end: 300,
            summary: 'Introduction to the topic.',
          },
        ],
        keyPoints: [
          'Key point 1',
          'Key point 2',
          'Key point 3',
        ],
      };
    case 'highlight':
      return {
        highlights: [
          {
            title: 'Key Insight',
            start: 120,
            end: 180,
            score: 0.85,
            reason: 'High engagement moment',
          },
        ],
      };
    default:
      return {};
  }
}
