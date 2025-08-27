// Created automatically by Cursor AI (2024-12-19)

import { IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessVideoDto {
  @ApiProperty({
    description: 'Processing steps to execute',
    example: ['probe', 'asr', 'segmentation', 'summarization'],
    enum: ['probe', 'asr', 'diarization', 'segmentation', 'summarization', 'highlights', 'clips'],
    isArray: true,
  })
  @IsArray()
  @IsIn(['probe', 'asr', 'diarization', 'segmentation', 'summarization', 'highlights', 'clips'], { each: true })
  steps: ('probe' | 'asr' | 'diarization' | 'segmentation' | 'summarization' | 'highlights' | 'clips')[];
}
