// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Captions } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  video: any;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
}

export function VideoPlayer({ video, currentTime, onTimeUpdate, onSeek }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!playing);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (playerRef.current) {
            const newTime = Math.max(0, currentTime - 10);
            playerRef.current.seekTo(newTime);
            onSeek(newTime);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (playerRef.current) {
            const newTime = Math.min(duration, currentTime + 10);
            playerRef.current.seekTo(newTime);
            onSeek(newTime);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setMuted(!muted);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playing, currentTime, duration, volume, muted, onSeek]);

  // Auto-hide controls
  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [playing, showControls]);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    onTimeUpdate(state.playedSeconds);
  }, [onTimeUpdate]);

  const handleSeek = useCallback((value: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(value);
      onSeek(value);
    }
  }, [onSeek]);

  const togglePlaying = () => setPlaying(!playing);
  const toggleMuted = () => setMuted(!muted);
  const toggleCaptions = () => setShowCaptions(!showCaptions);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (playing) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ReactPlayer
        ref={playerRef}
        url={video.url || video.file}
        playing={playing}
        volume={muted ? 0 : volume}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={setDuration}
        onReady={() => setDuration(playerRef.current?.getDuration() || 0)}
        controls={false}
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous"
            }
          }
        }}
      />

      {/* Chapters Bar */}
      {chapters.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/50">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="absolute h-full bg-primary/50 cursor-pointer hover:bg-primary/70 transition-colors"
              style={{
                left: `${(chapter.startTime / duration) * 100}%`,
                width: `${((chapter.endTime - chapter.startTime) / duration) * 100}%`
              }}
              onClick={() => handleSeek(chapter.startTime)}
              title={chapter.title}
            />
          ))}
        </div>
      )}

      {/* Controls Overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => handleSeek(value)}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlaying}
              className="text-white hover:bg-white/20"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 text-white text-sm">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMuted}
                className="text-white hover:bg-white/20"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                onValueChange={([value]) => {
                  setVolume(value / 100);
                  setMuted(value === 0);
                }}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCaptions}
              className={cn(
                "text-white hover:bg-white/20",
                showCaptions && "bg-white/20"
              )}
            >
              <Captions className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Captions */}
      {showCaptions && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-center max-w-md">
          <p className="text-sm">
            {/* This would display actual captions from the video */}
            Sample caption text would appear here...
          </p>
        </div>
      )}
    </div>
  );
}
