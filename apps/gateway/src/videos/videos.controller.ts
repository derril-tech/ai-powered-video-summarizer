// Created automatically by Cursor AI (2024-12-19)

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { ProcessVideoDto } from './dto/process-video.dto';

@ApiTags('videos')
@Controller('videos')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new video' })
  @ApiResponse({ status: 201, description: 'Video created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createVideoDto: CreateVideoDto, @Request() req) {
    return this.videosService.create(createVideoDto, req.user.orgId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos for the organization' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['uploading', 'processing', 'ready', 'failed', 'deleted'] })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.videosService.findAll(req.user.orgId, { page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.videosService.findOne(id, req.user.orgId);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a video with specified steps' })
  @ApiResponse({ status: 200, description: 'Video processing started' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async process(@Param('id') id: string, @Body() processVideoDto: ProcessVideoDto, @Request() req) {
    return this.videosService.process(id, processVideoDto, req.user.orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 204, description: 'Video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.videosService.remove(id, req.user.orgId);
  }
}
