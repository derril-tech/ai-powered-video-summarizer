// Created automatically by Cursor AI (2024-12-19)

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { ProcessVideoDto } from './dto/process-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async create(createVideoDto: CreateVideoDto, orgId: string): Promise<Video> {
    const video = this.videoRepository.create({
      ...createVideoDto,
      orgId,
      status: 'uploading',
      duration: 0,
      size: 0,
      format: 'unknown',
      metadata: {},
    });

    return this.videoRepository.save(video);
  }

  async findAll(orgId: string, options: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      .where('video.orgId = :orgId', { orgId })
      .orderBy('video.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('video.status = :status', { status });
    }

    const [videos, total] = await queryBuilder.getManyAndCount();

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id, orgId },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    return video;
  }

  async process(id: string, processVideoDto: ProcessVideoDto, orgId: string) {
    const video = await this.findOne(id, orgId);

    // TODO: Implement actual processing logic
    // This would typically involve:
    // 1. Updating video status to 'processing'
    // 2. Publishing messages to NATS for worker processing
    // 3. Returning job status

    video.status = 'processing';
    await this.videoRepository.save(video);

    return {
      message: 'Video processing started',
      videoId: id,
      steps: processVideoDto.steps,
      status: 'processing',
    };
  }

  async remove(id: string, orgId: string): Promise<void> {
    const video = await this.findOne(id, orgId);
    
    // TODO: Implement soft delete or actual deletion logic
    // This might involve:
    // 1. Deleting associated files from S3
    // 2. Cleaning up database records
    // 3. Updating status to 'deleted'

    video.status = 'deleted';
    await this.videoRepository.save(video);
  }
}
