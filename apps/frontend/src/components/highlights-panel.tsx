// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Star, GripVertical, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HighlightsPanelProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

interface Highlight {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  score: number;
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  thumbnail?: string;
}

export function HighlightsPanel({ videoId, currentTime, onSeek }: HighlightsPanelProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockHighlights: Highlight[] = [
      {
        id: '1',
        title: 'AI Fundamentals Introduction',
        startTime: 30,
        endTime: 90,
        score: 0.95,
        status: 'completed'
      },
      {
        id: '2',
        title: 'Machine Learning Deep Dive',
        startTime: 150,
        endTime: 210,
        score: 0.92,
        status: 'rendering'
      },
      {
        id: '3',
        title: 'Neural Networks Explanation',
        startTime: 280,
        endTime: 340,
        score: 0.88,
        status: 'pending'
      },
      {
        id: '4',
        title: 'Future of AI Discussion',
        startTime: 450,
        endTime: 510,
        score: 0.85,
        status: 'pending'
      },
      {
        id: '5',
        title: 'Ethical Considerations',
        startTime: 520,
        endTime: 580,
        score: 0.82,
        status: 'failed'
      }
    ];

    setHighlights(mockHighlights);
    setIsLoading(false);
  }, [videoId]);

  const handleHighlightClick = (highlight: Highlight) => {
    onSeek(highlight.startTime);
  };

  const handleRenderHighlight = (highlightId: string) => {
    setHighlights(highlights.map(h =>
      h.id === highlightId ? { ...h, status: 'rendering' as const } : h
    ));
  };

  const handleDeleteHighlight = (highlightId: string) => {
    setHighlights(highlights.filter(h => h.id !== highlightId));
  };

  const getStatusColor = (status: Highlight['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rendering': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Highlight['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'rendering': return '⟳';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-2">AI-Generated Highlights</h3>
        <p className="text-sm text-muted-foreground">
          {highlights.length} highlights detected • {highlights.filter(h => h.status === 'completed').length} ready
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium truncate">{highlight.title}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">
                        {Math.round(highlight.score * 100)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(highlight.startTime)} - {formatDuration(highlight.endTime)}</span>
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(highlight.status))}>
                      {getStatusIcon(highlight.status)} {highlight.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHighlightClick(highlight)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Preview
                    </Button>

                    {highlight.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleRenderHighlight(highlight.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Render
                      </Button>
                    )}

                    {highlight.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Average score: {Math.round(
            highlights.reduce((sum, h) => sum + h.score, 0) / highlights.length * 100
          )}%</span>
          <span>{highlights.filter(h => h.status === 'rendering').length} rendering</span>
        </div>
      </div>
    </div>
  );
}
