// Created automatically by Cursor AI (2024-12-19)
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RealtimeService } from './realtime.service';

@Controller('sse')
@UseGuards(AuthGuard('jwt'))
export class SseController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get('video/:videoId')
  async videoEvents(@Param('videoId') videoId: string, @Res() res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', videoId })}\n\n`);

    // TODO: Set up event listeners for video updates
    // This would integrate with the NATS messaging system

    // Keep connection alive
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
    }, 30000);

    // Clean up on disconnect
    res.on('close', () => {
      clearInterval(interval);
    });
  }
}
