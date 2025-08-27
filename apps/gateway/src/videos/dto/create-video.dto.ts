// Created automatically by Cursor AI (2024-12-19)

import { IsString, IsOptional, IsUrl, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Video title',
    example: 'Introduction to AI Video Summarization',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Video description',
    example: 'A comprehensive overview of AI-powered video summarization techniques',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Video URL (for remote videos)',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Project ID to associate the video with',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
