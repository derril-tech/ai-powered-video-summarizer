// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { TranscriptPanel } from '@/components/transcript-panel';
import { SummaryPanel } from '@/components/summary-panel';
import { HighlightsPanel } from '@/components/highlights-panel';
import { ExportsPanel } from '@/components/exports-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function VideoWorkspacePage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transcript');
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (response.ok) {
          const videoData = await response.json();
          setVideo(videoData);
        } else {
          throw new Error('Failed to fetch video');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load video',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId, toast]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    // This would be handled by the video player component
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-muted-foreground mb-4">
            The video you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{video.title}</h1>
              <p className="text-sm text-muted-foreground">
                Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video Player */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 p-4">
            <Card className="h-full">
              <VideoPlayer
                video={video}
                currentTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
                onSeek={handleSeek}
              />
            </Card>
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-1/3 border-l flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="exports">Exports</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="transcript" className="h-full m-0">
                <TranscriptPanel
                  videoId={videoId}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </TabsContent>

              <TabsContent value="summary" className="h-full m-0">
                <SummaryPanel
                  videoId={videoId}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </TabsContent>

              <TabsContent value="highlights" className="h-full m-0">
                <HighlightsPanel
                  videoId={videoId}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </TabsContent>

              <TabsContent value="exports" className="h-full m-0">
                <ExportsPanel videoId={videoId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
