// Created automatically by Cursor AI (2024-12-19)
import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('video/:videoId/status')
  @ApiOperation({ summary: 'Get video processing job status' })
  @ApiResponse({ status: 200, description: 'Job status retrieved successfully' })
  async getVideoJobStatus(@Param('videoId') videoId: string, @Request() req) {
    // TODO: Implement job status tracking
    return {
      videoId,
      status: 'processing',
      jobs: [
        { type: 'probe', status: 'completed' },
        { type: 'asr', status: 'in_progress' },
        { type: 'diarization', status: 'pending' },
        { type: 'segmentation', status: 'pending' },
        { type: 'summarization', status: 'pending' },
        { type: 'highlight', status: 'pending' },
      ],
    };
  }

  @Post('video/:videoId/retry')
  @ApiOperation({ summary: 'Retry failed video processing jobs' })
  @ApiResponse({ status: 200, description: 'Jobs retried successfully' })
  async retryVideoJobs(
    @Param('videoId') videoId: string,
    @Body() body: { jobTypes?: string[] },
    @Request() req,
  ) {
    // TODO: Implement job retry logic
    return {
      videoId,
      message: 'Jobs retried successfully',
      retriedJobs: body.jobTypes || ['asr', 'summarization'],
    };
  }

  @Get('dlq')
  @ApiOperation({ summary: 'Get dead letter queue jobs' })
  @ApiResponse({ status: 200, description: 'DLQ jobs retrieved successfully' })
  async getDLQJobs(@Request() req) {
    // TODO: Implement DLQ job retrieval
    return {
      jobs: [
        {
          id: 'job_123',
          type: 'asr',
          error: 'GPU timeout',
          videoId: 'video_456',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
