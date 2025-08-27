// Created automatically by Cursor AI (2024-12-19)
import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { RealtimeService } from '../realtime/realtime.service';

export interface JobMessage {
  id: string;
  type: string;
  data: any;
  retries: number;
  maxRetries: number;
  createdAt: string;
  orgId: string;
  userId: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly natsService: NatsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async publishJob(job: JobMessage): Promise<void> {
    const subject = `jobs.${job.type}`;
    const message = {
      ...job,
      createdAt: new Date().toISOString(),
    };

    await this.natsService.publish(subject, message);
    this.logger.log(`Published job ${job.id} of type ${job.type}`);
  }

  async publishVideoJob(videoId: string, jobType: string, data: any, orgId: string, userId: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: JobMessage = {
      id: jobId,
      type: jobType,
      data: { videoId, ...data },
      retries: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      orgId,
      userId,
    };

    await this.publishJob(job);
    
    // Notify clients about job start
    await this.realtimeService.broadcastToVideo(videoId, 'job:started', {
      jobId,
      type: jobType,
      videoId,
    });

    return jobId;
  }

  async handleJobResult(jobId: string, result: any, videoId: string): Promise<void> {
    // Notify clients about job completion
    await this.realtimeService.broadcastToVideo(videoId, 'job:completed', {
      jobId,
      result,
      videoId,
    });

    this.logger.log(`Job ${jobId} completed successfully`);
  }

  async handleJobError(jobId: string, error: string, videoId: string, retries: number, maxRetries: number): Promise<void> {
    if (retries < maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
      setTimeout(async () => {
        // TODO: Republish job with incremented retry count
        this.logger.warn(`Retrying job ${jobId} (attempt ${retries + 1}/${maxRetries})`);
      }, delay);
    } else {
      // Send to Dead Letter Queue
      await this.publishToDLQ(jobId, error, videoId);
      
      // Notify clients about job failure
      await this.realtimeService.broadcastToVideo(videoId, 'job:failed', {
        jobId,
        error,
        videoId,
      });

      this.logger.error(`Job ${jobId} failed permanently, sent to DLQ`);
    }
  }

  private async publishToDLQ(jobId: string, error: string, videoId: string): Promise<void> {
    const dlqMessage = {
      jobId,
      error,
      videoId,
      timestamp: new Date().toISOString(),
    };

    await this.natsService.publish('jobs.dlq', dlqMessage);
  }

  // Job orchestration methods for video processing pipeline
  async startVideoProcessing(videoId: string, orgId: string, userId: string): Promise<string[]> {
    const jobIds: string[] = [];

    // 1. Probe video for metadata
    const probeJobId = await this.publishVideoJob(videoId, 'probe', {}, orgId, userId);
    jobIds.push(probeJobId);

    // 2. ASR transcription
    const asrJobId = await this.publishVideoJob(videoId, 'asr', {}, orgId, userId);
    jobIds.push(asrJobId);

    // 3. Speaker diarization
    const diarizationJobId = await this.publishVideoJob(videoId, 'diarization', {}, orgId, userId);
    jobIds.push(diarizationJobId);

    // 4. Scene segmentation
    const segmentationJobId = await this.publishVideoJob(videoId, 'segmentation', {}, orgId, userId);
    jobIds.push(segmentationJobId);

    // 5. Summarization
    const summarizationJobId = await this.publishVideoJob(videoId, 'summarization', {}, orgId, userId);
    jobIds.push(summarizationJobId);

    // 6. Highlight detection
    const highlightJobId = await this.publishVideoJob(videoId, 'highlight', {}, orgId, userId);
    jobIds.push(highlightJobId);

    return jobIds;
  }
}
