// Created automatically by Cursor AI (2024-12-19)

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { TranscriptsModule } from './transcripts/transcripts.module';
import { ChaptersModule } from './chapters/chapters.module';
import { SummariesModule } from './summaries/summaries.module';
import { HighlightsModule } from './highlights/highlights.module';
import { ClipsModule } from './clips/clips.module';
import { ExportsModule } from './exports/exports.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    VideosModule,
    TranscriptsModule,
    ChaptersModule,
    SummariesModule,
    HighlightsModule,
    ClipsModule,
    ExportsModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
