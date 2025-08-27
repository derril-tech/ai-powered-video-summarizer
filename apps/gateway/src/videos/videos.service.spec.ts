// Created automatically by Cursor AI (2024-12-19)
import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { FileService } from '../file/file.service';
import { JobsService } from '../jobs/jobs.service';
import { DatabaseService } from '../database/database.service';
import { RealtimeService } from '../realtime/realtime.service';
import { 
  mockUser, 
  mockVideo, 
  mockDatabase, 
  mockFileService, 
  mockJobService, 
  mockRealtimeService 
} from '../../test/setup';

describe('VideosService', () => {
  let service: VideosService;
  let fileService: jest.Mocked<FileService>;
  let jobsService: jest.Mocked<JobsService>;
  let databaseService: jest.Mocked<DatabaseService>;
  let realtimeService: jest.Mocked<RealtimeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: FileService,
          useValue: mockFileService,
        },
        {
          provide: JobsService,
          useValue: mockJobService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
    fileService = module.get(FileService);
    jobsService = module.get(JobsService);
    databaseService = module.get(DatabaseService);
    realtimeService = module.get(RealtimeService);
  });

  describe('createVideo', () => {
    it('should create a video record and return video data', async () => {
      const createVideoDto = {
        title: 'Test Video',
        description: 'Test description',
        url: 'https://example.com/video.mp4',
      };

      const expectedVideo = {
        ...mockVideo,
        ...createVideoDto,
        status: 'uploading',
      };

      mockDatabase.videos.create.mockResolvedValue(expectedVideo);
      mockFileService.generatePresignedUrl.mockResolvedValue('https://presigned-url.com');

      const result = await service.createVideo(createVideoDto, mockUser);

      expect(mockDatabase.videos.create).toHaveBeenCalledWith({
        data: {
          ...createVideoDto,
          orgId: mockUser.orgId,
          userId: mockUser.id,
          status: 'uploading',
        },
      });

      expect(mockFileService.generatePresignedUrl).toHaveBeenCalledWith(
        'videos',
        expect.any(String),
        'PUT',
        3600
      );

      expect(result).toEqual({
        video: expectedVideo,
        uploadUrl: 'https://presigned-url.com',
      });
    });

    it('should handle database errors gracefully', async () => {
      const createVideoDto = {
        title: 'Test Video',
        description: 'Test description',
        url: 'https://example.com/video.mp4',
      };

      mockDatabase.videos.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createVideo(createVideoDto, mockUser)).rejects.toThrow('Database error');
    });
  });

  describe('getVideo', () => {
    it('should return video with all related data', async () => {
      const videoId = 'test-video-id';
      const expectedVideo = {
        ...mockVideo,
        transcript: { id: 'transcript-1', segments: [] },
        summaries: [{ id: 'summary-1', type: 'executive' }],
        highlights: [{ id: 'highlight-1', title: 'Key Point' }],
        chapters: [{ id: 'chapter-1', title: 'Introduction' }],
      };

      mockDatabase.videos.findOne.mockResolvedValue(expectedVideo);

      const result = await service.getVideo(videoId, mockUser);

      expect(mockDatabase.videos.findOne).toHaveBeenCalledWith({
        where: {
          id: videoId,
          orgId: mockUser.orgId,
        },
        include: {
          transcript: true,
          summaries: true,
          highlights: true,
          chapters: true,
          exports: true,
        },
      });

      expect(result).toEqual(expectedVideo);
    });

    it('should throw error if video not found', async () => {
      const videoId = 'non-existent-video';
      mockDatabase.videos.findOne.mockResolvedValue(null);

      await expect(service.getVideo(videoId, mockUser)).rejects.toThrow('Video not found');
    });

    it('should enforce organization isolation', async () => {
      const videoId = 'test-video-id';
      const otherOrgUser = { ...mockUser, orgId: 'other-org-id' };

      mockDatabase.videos.findOne.mockResolvedValue(null);

      await expect(service.getVideo(videoId, otherOrgUser)).rejects.toThrow('Video not found');

      expect(mockDatabase.videos.findOne).toHaveBeenCalledWith({
        where: {
          id: videoId,
          orgId: 'other-org-id',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('processVideo', () => {
    it('should start video processing pipeline', async () => {
      const videoId = 'test-video-id';
      const steps = ['asr', 'summarization', 'highlight'];
      const expectedJobIds = ['job-1', 'job-2', 'job-3'];

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);
      mockJobService.startVideoProcessing.mockResolvedValue(expectedJobIds);
      mockDatabase.videos.update.mockResolvedValue({ ...mockVideo, status: 'processing' });

      const result = await service.processVideo(videoId, steps, mockUser);

      expect(mockDatabase.videos.findOne).toHaveBeenCalledWith({
        where: {
          id: videoId,
          orgId: mockUser.orgId,
        },
      });

      expect(mockJobService.startVideoProcessing).toHaveBeenCalledWith(
        videoId,
        mockUser.orgId,
        mockUser.id
      );

      expect(mockDatabase.videos.update).toHaveBeenCalledWith({
        where: { id: videoId },
        data: { status: 'processing' },
      });

      expect(result).toEqual({
        videoId,
        status: 'processing',
        jobIds: expectedJobIds,
      });
    });

    it('should validate video status before processing', async () => {
      const videoId = 'test-video-id';
      const steps = ['asr'];
      const completedVideo = { ...mockVideo, status: 'completed' };

      mockDatabase.videos.findOne.mockResolvedValue(completedVideo);

      await expect(service.processVideo(videoId, steps, mockUser)).rejects.toThrow(
        'Video is already processed'
      );
    });

    it('should handle processing errors gracefully', async () => {
      const videoId = 'test-video-id';
      const steps = ['asr'];

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);
      mockJobService.startVideoProcessing.mockRejectedValue(new Error('Processing failed'));

      await expect(service.processVideo(videoId, steps, mockUser)).rejects.toThrow('Processing failed');
    });
  });

  describe('updateVideo', () => {
    it('should update video metadata', async () => {
      const videoId = 'test-video-id';
      const updateDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };
      const updatedVideo = { ...mockVideo, ...updateDto };

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);
      mockDatabase.videos.update.mockResolvedValue(updatedVideo);

      const result = await service.updateVideo(videoId, updateDto, mockUser);

      expect(mockDatabase.videos.update).toHaveBeenCalledWith({
        where: { id: videoId, orgId: mockUser.orgId },
        data: updateDto,
      });

      expect(result).toEqual(updatedVideo);
    });

    it('should validate title length', async () => {
      const videoId = 'test-video-id';
      const updateDto = {
        title: 'A'.repeat(256), // Too long title
      };

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);

      await expect(service.updateVideo(videoId, updateDto, mockUser)).rejects.toThrow(
        'Title must be less than 255 characters'
      );
    });
  });

  describe('deleteVideo', () => {
    it('should delete video and related files', async () => {
      const videoId = 'test-video-id';

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);
      mockDatabase.videos.delete.mockResolvedValue(mockVideo);
      mockFileService.deleteFile.mockResolvedValue(undefined);

      const result = await service.deleteVideo(videoId, mockUser);

      expect(mockDatabase.videos.delete).toHaveBeenCalledWith({
        where: { id: videoId, orgId: mockUser.orgId },
      });

      expect(mockFileService.deleteFile).toHaveBeenCalledWith('videos', videoId);

      expect(result).toEqual({ success: true });
    });

    it('should handle file deletion errors gracefully', async () => {
      const videoId = 'test-video-id';

      mockDatabase.videos.findOne.mockResolvedValue(mockVideo);
      mockDatabase.videos.delete.mockResolvedValue(mockVideo);
      mockFileService.deleteFile.mockRejectedValue(new Error('File deletion failed'));

      // Should still succeed even if file deletion fails
      const result = await service.deleteVideo(videoId, mockUser);

      expect(result).toEqual({ success: true });
    });
  });

  describe('getVideoStatus', () => {
    it('should return comprehensive video status', async () => {
      const videoId = 'test-video-id';
      const videoWithData = {
        ...mockVideo,
        transcript: { id: 'transcript-1', segments: [{ id: 'seg-1' }] },
        summaries: [{ id: 'summary-1', type: 'executive' }],
        highlights: [{ id: 'highlight-1' }],
        chapters: [{ id: 'chapter-1' }],
        exports: [{ id: 'export-1', format: 'pdf' }],
      };

      mockDatabase.videos.findOne.mockResolvedValue(videoWithData);

      const result = await service.getVideoStatus(videoId, mockUser);

      expect(result).toEqual({
        videoId,
        status: 'processing',
        progress: {
          transcript: 100,
          summarization: 100,
          highlights: 100,
          chapters: 100,
          exports: 100,
        },
        hasTranscript: true,
        hasSummaries: true,
        hasHighlights: true,
        hasChapters: true,
        hasExports: true,
      });
    });

    it('should calculate progress correctly for partial completion', async () => {
      const videoId = 'test-video-id';
      const partialVideo = {
        ...mockVideo,
        transcript: { id: 'transcript-1', segments: [] },
        summaries: null,
        highlights: null,
        chapters: null,
        exports: null,
      };

      mockDatabase.videos.findOne.mockResolvedValue(partialVideo);

      const result = await service.getVideoStatus(videoId, mockUser);

      expect(result.progress).toEqual({
        transcript: 100,
        summarization: 0,
        highlights: 0,
        chapters: 0,
        exports: 0,
      });
    });
  });

  describe('searchVideos', () => {
    it('should search videos with filters', async () => {
      const searchDto = {
        query: 'test',
        status: 'completed',
        limit: 10,
        offset: 0,
      };
      const searchResults = [mockVideo];

      mockDatabase.videos.findMany.mockResolvedValue(searchResults);

      const result = await service.searchVideos(searchDto, mockUser);

      expect(mockDatabase.videos.findMany).toHaveBeenCalledWith({
        where: {
          orgId: mockUser.orgId,
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
          status: 'completed',
        },
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(searchResults);
    });

    it('should handle empty search results', async () => {
      const searchDto = {
        query: 'nonexistent',
        limit: 10,
        offset: 0,
      };

      mockDatabase.videos.findMany.mockResolvedValue([]);

      const result = await service.searchVideos(searchDto, mockUser);

      expect(result).toEqual([]);
    });
  });
});
