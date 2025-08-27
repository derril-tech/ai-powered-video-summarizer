// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { Edit, Check, X, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SummaryPanelProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  isEditing?: boolean;
  isApproved?: boolean;
}

export function SummaryPanel({ videoId, currentTime, onSeek }: SummaryPanelProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        title: 'Introduction to AI',
        startTime: 0,
        endTime: 120,
        summary: 'The presentation begins with an overview of artificial intelligence, covering its definition, history, and current applications in various industries.',
        isApproved: true
      },
      {
        id: '2',
        title: 'Machine Learning Fundamentals',
        startTime: 120,
        endTime: 300,
        summary: 'Deep dive into machine learning concepts including supervised learning, unsupervised learning, and neural networks.',
        isApproved: false
      },
      {
        id: '3',
        title: 'Deep Learning Applications',
        startTime: 300,
        endTime: 480,
        summary: 'Exploration of deep learning applications in computer vision, natural language processing, and robotics.',
        isApproved: true
      },
      {
        id: '4',
        title: 'Future Trends and Challenges',
        startTime: 480,
        endTime: 600,
        summary: 'Discussion of emerging trends in AI, ethical considerations, and challenges facing the industry.',
        isApproved: false
      }
    ];

    const mockExecutiveSummary = `This comprehensive presentation covers the fundamentals of artificial intelligence and machine learning, exploring current applications and future trends. Key highlights include the evolution of AI technology, practical applications in various industries, and important ethical considerations for responsible AI development.`;

    setChapters(mockChapters);
    setExecutiveSummary(mockExecutiveSummary);
    setIsLoading(false);
  }, [videoId]);

  const handleChapterEdit = (chapterId: string) => {
    setChapters(chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, isEditing: true } : chapter
    ));
  };

  const handleChapterSave = (chapterId: string, newSummary: string) => {
    setChapters(chapters.map(chapter =>
      chapter.id === chapterId 
        ? { ...chapter, summary: newSummary, isEditing: false, isApproved: false }
        : chapter
    ));
  };

  const handleChapterCancel = (chapterId: string) => {
    setChapters(chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, isEditing: false } : chapter
    ));
  };

  const handleChapterApprove = (chapterId: string) => {
    setChapters(chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, isApproved: true } : chapter
    ));
  };

  const handleChapterClick = (chapter: Chapter) => {
    onSeek(chapter.startTime);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="executive" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="flex-1 p-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Executive Summary</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{executiveSummary}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Key Points</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>AI fundamentals and current applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Machine learning and deep learning concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Future trends and ethical considerations</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="outline" className="flex-1 p-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Video Outline</h3>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleChapterClick(chapter)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{chapter.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(chapter.startTime)} - {formatDuration(chapter.endTime)}
                    </p>
                  </div>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chapters" className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Chapter Summaries</h3>
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{chapter.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(chapter.startTime)} - {formatDuration(chapter.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {chapter.isApproved && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChapterClick(chapter)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {chapter.isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={chapter.summary}
                        onChange={(e) => {
                          setChapters(chapters.map(c =>
                            c.id === chapter.id ? { ...c, summary: e.target.value } : c
                          ));
                        }}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleChapterSave(chapter.id, chapter.summary)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChapterCancel(chapter.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">{chapter.summary}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChapterEdit(chapter.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {!chapter.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleChapterApprove(chapter.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
