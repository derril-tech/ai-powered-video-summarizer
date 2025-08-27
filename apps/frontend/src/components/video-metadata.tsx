// Created automatically by Cursor AI (2024-12-19)
'use client';

import { formatDuration, formatFileSize } from '@/lib/utils';

interface VideoMetadataProps {
  metadata: {
    title: string;
    duration: number;
    size: number;
    format: string;
    resolution?: string;
    fps?: number;
    bitrate?: string;
  };
}

export function VideoMetadata({ metadata }: VideoMetadataProps) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt className="font-medium text-muted-foreground">Title</dt>
        <dd className="mt-1">{metadata.title}</dd>
      </div>
      <div>
        <dt className="font-medium text-muted-foreground">Duration</dt>
        <dd className="mt-1">{formatDuration(metadata.duration)}</dd>
      </div>
      <div>
        <dt className="font-medium text-muted-foreground">File Size</dt>
        <dd className="mt-1">{formatFileSize(metadata.size)}</dd>
      </div>
      <div>
        <dt className="font-medium text-muted-foreground">Format</dt>
        <dd className="mt-1 uppercase">{metadata.format}</dd>
      </div>
      {metadata.resolution && (
        <div>
          <dt className="font-medium text-muted-foreground">Resolution</dt>
          <dd className="mt-1">{metadata.resolution}</dd>
        </div>
      )}
      {metadata.fps && (
        <div>
          <dt className="font-medium text-muted-foreground">Frame Rate</dt>
          <dd className="mt-1">{metadata.fps} fps</dd>
        </div>
      )}
      {metadata.bitrate && (
        <div>
          <dt className="font-medium text-muted-foreground">Bitrate</dt>
          <dd className="mt-1">{metadata.bitrate}</dd>
        </div>
      )}
    </div>
  );
}
