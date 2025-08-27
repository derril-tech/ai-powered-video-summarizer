// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { VideoMetadata } from '@/components/video-metadata';
import { TranscriptPanel } from '@/components/transcript-panel';
import { SummaryPanel } from '@/components/summary-panel';
import { HighlightsPanel } from '@/components/highlights-panel';
import { ExportsPanel } from '@/components/exports-panel';
import { CommentsPanel } from '@/components/comments-panel';
import { SearchPage } from '@/components/search-page';
import { EntitiesPanel } from '@/components/entities-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Hash, FileText, Star, Download, Users } from 'lucide-react';

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    // This would trigger the video player to seek to the specified time
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const tabs = [
    {
      id: 'transcript',
      label: 'Transcript',
      icon: FileText,
      component: <TranscriptPanel videoId={videoId} currentTime={currentTime} onSeek={handleSeek} />
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: FileText,
      component: <SummaryPanel videoId={videoId} onSeek={handleSeek} />
    },
    {
      id: 'highlights',
      label: 'Highlights',
      icon: Star,
      component: <HighlightsPanel videoId={videoId} onSeek={handleSeek} />
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      component: <CommentsPanel videoId={videoId} currentTime={currentTime} onSeek={handleSeek} />
    },
    {
      id: 'entities',
      label: 'Entities',
      icon: Hash,
      component: <EntitiesPanel videoId={videoId} onSeek={handleSeek} />
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      component: <SearchPage />
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: Download,
      component: <ExportsPanel videoId={videoId} />
    }
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Video Analysis</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
            <Button variant="outline" size="sm">
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Video Player and Metadata */}
        <div className="w-2/3 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 p-4">
            <VideoPlayer
              videoId={videoId}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlayPause={handlePlayPause}
            />
          </div>

          {/* Video Metadata */}
          <div className="p-4 border-t">
            <VideoMetadata videoId={videoId} />
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-1/3 border-l flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4 h-12">
                {tabs.slice(0, 4).map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 h-12">
                {tabs.slice(4).map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                  {tab.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
