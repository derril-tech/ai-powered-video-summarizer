// Created automatically by Cursor AI (2024-12-19)
import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';

@Module({
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {}
