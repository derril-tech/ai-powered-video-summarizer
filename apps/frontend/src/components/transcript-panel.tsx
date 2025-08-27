// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Play, Pause } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export function TranscriptPanel({ videoId, currentTime, onSeek }: TranscriptPanelProps) {
  const [transcript, setTranscript] = useState<TranscriptWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  // Mock transcript data
  useEffect(() => {
    const mockTranscript: TranscriptWord[] = [
      { word: "Hello", start: 0, end: 0.5, confidence: 0.95, speaker: "Speaker 1" },
      { word: "everyone", start: 0.5, end: 1.2, confidence: 0.92, speaker: "Speaker 1" },
      { word: "welcome", start: 1.2, end: 1.8, confidence: 0.88, speaker: "Speaker 1" },
      { word: "to", start: 1.8, end: 2.0, confidence: 0.98, speaker: "Speaker 1" },
      { word: "our", start: 2.0, end: 2.3, confidence: 0.94, speaker: "Speaker 1" },
      { word: "presentation", start: 2.3, end: 3.2, confidence: 0.85, speaker: "Speaker 1" },
      { word: "today", start: 3.2, end: 3.8, confidence: 0.91, speaker: "Speaker 1" },
      { word: "we'll", start: 3.8, end: 4.1, confidence: 0.87, speaker: "Speaker 1" },
      { word: "be", start: 4.1, end: 4.3, confidence: 0.96, speaker: "Speaker 1" },
      { word: "discussing", start: 4.3, end: 5.1, confidence: 0.83, speaker: "Speaker 1" },
      { word: "the", start: 5.1, end: 5.2, confidence: 0.99, speaker: "Speaker 1" },
      { word: "future", start: 5.2, end: 5.8, confidence: 0.89, speaker: "Speaker 1" },
      { word: "of", start: 5.8, end: 6.0, confidence: 0.97, speaker: "Speaker 1" },
      { word: "artificial", start: 6.0, end: 6.8, confidence: 0.82, speaker: "Speaker 1" },
      { word: "intelligence", start: 6.8, end: 7.5, confidence: 0.86, speaker: "Speaker 1" },
      { word: "and", start: 7.5, end: 7.7, confidence: 0.98, speaker: "Speaker 1" },
      { word: "machine", start: 7.7, end: 8.2, confidence: 0.90, speaker: "Speaker 1" },
      { word: "learning", start: 8.2, end: 8.9, confidence: 0.84, speaker: "Speaker 1" },
    ];

    setTranscript(mockTranscript);
    setIsLoading(false);
  }, [videoId]);

  // Find current word based on time
  useEffect(() => {
    const index = transcript.findIndex(
      word => currentTime >= word.start && currentTime <= word.end
    );
    setCurrentWordIndex(index);
  }, [currentTime, transcript]);

  // Filter transcript based on search
  const filteredTranscript = useMemo(() => {
    if (!searchQuery.trim()) return transcript;
    
    return transcript.filter(word =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transcript, searchQuery]);

  // Highlight search matches
  const highlightWord = (word: string) => {
    if (!searchQuery.trim()) return word;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = word.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleWordClick = (word: TranscriptWord) => {
    onSeek(word.start);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    if (confidence >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredTranscript.map((word, index) => {
            const isCurrentWord = index === currentWordIndex;
            const isLowConfidence = word.confidence < 0.8;
            
            return (
              <div
                key={`${word.start}-${word.end}`}
                className={cn(
                  "inline-block cursor-pointer rounded px-1 py-0.5 transition-colors",
                  isCurrentWord && "bg-primary/20 text-primary font-medium",
                  !isCurrentWord && "hover:bg-muted",
                  isLowConfidence && "text-muted-foreground/60"
                )}
                onClick={() => handleWordClick(word)}
                title={`${formatDuration(word.start)} - ${formatDuration(word.end)} (${Math.round(word.confidence * 100)}% confidence)`}
              >
                <span className={cn(
                  "text-xs",
                  getConfidenceColor(word.confidence)
                )}>
                  {formatDuration(word.start)}
                </span>
                <span className="ml-2">
                  {highlightWord(word.word)}
                </span>
                {word.speaker && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({word.speaker})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>{transcript.length} words</span>
          <span>
            {Math.round(
              (transcript.reduce((sum, word) => sum + word.confidence, 0) / transcript.length) * 100
            )}% avg confidence
          </span>
        </div>
      </div>
    </div>
  );
}
