// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  className?: string;
}

export function VideoUploader({ onUpload, className }: VideoUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v']
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 500, // 500MB
  });

  const removeFile = () => {
    acceptedFiles.splice(0, 1);
  };

  return (
    <div className={cn('w-full', className)}>
      {acceptedFiles.length === 0 ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'Drop your video here' : 'Upload a video'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your video file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V (max 500MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileVideo className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{acceptedFiles[0].name}</p>
              <p className="text-sm text-muted-foreground">
                {(acceptedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
