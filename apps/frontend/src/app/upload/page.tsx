// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Link, FileVideo, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { VideoUploader } from '@/components/video-uploader';
import { VideoMetadata } from '@/components/video-metadata';

export default function UploadPage() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid video URL',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // Mock video metadata
      const metadata = {
        title: 'Sample Video',
        duration: 3600,
        size: 1024 * 1024 * 100, // 100MB
        format: 'mp4',
        resolution: '1920x1080',
        fps: 30,
        bitrate: '5000kbps',
      };

      setVideoMetadata(metadata);
      toast({
        title: 'Success',
        description: 'Video URL processed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process video URL',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate file upload
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Mock video metadata
      const metadata = {
        title: file.name,
        duration: 1800,
        size: file.size,
        format: file.name.split('.').pop(),
        resolution: '1280x720',
        fps: 25,
        bitrate: '3000kbps',
      };

      setVideoMetadata(metadata);
      setUploadedVideo({ file, metadata });
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!videoMetadata) return;

    try {
      // Create video record and start processing
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoMetadata.title,
          url: url || undefined,
          duration: videoMetadata.duration,
          size: videoMetadata.size,
          format: videoMetadata.format,
        }),
      });

      if (response.ok) {
        const video = await response.json();
        router.push(`/workspace/${video.id}`);
      } else {
        throw new Error('Failed to create video');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start video processing',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload Video</h1>
        <p className="text-muted-foreground">
          Upload a video file or provide a URL to start analyzing and summarizing
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Video URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Upload Video File
              </CardTitle>
              <CardDescription>
                Drag and drop your video file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUploader onUpload={handleFileUpload} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Video URL
              </CardTitle>
              <CardDescription>
                Enter a video URL from YouTube, Vimeo, or other supported platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                  <Button onClick={handleUrlSubmit} disabled={isProcessing || !url.trim()}>
                    {isProcessing ? 'Processing...' : 'Process'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 animate-pulse" />
              Processing Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={uploadProgress} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              {uploadProgress < 100 ? 'Processing video...' : 'Processing complete!'}
            </p>
          </CardContent>
        </Card>
      )}

      {videoMetadata && !isProcessing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Video Ready
            </CardTitle>
            <CardDescription>
              Video has been processed and is ready for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoMetadata metadata={videoMetadata} />
            <div className="mt-6 flex gap-2">
              <Button onClick={handleStartProcessing} className="flex-1">
                Start Analysis
              </Button>
              <Button variant="outline" onClick={() => {
                setVideoMetadata(null);
                setUploadedVideo(null);
                setUrl('');
              }}>
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
