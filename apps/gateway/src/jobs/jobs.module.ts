// Created automatically by Cursor AI (2024-12-19)
import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [NatsModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
