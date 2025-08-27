// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Check, FileText, FileVideo, FileCode, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExportsPanelProps {
  videoId: string;
}

interface Export {
  id: string;
  type: 'srt' | 'vtt' | 'md' | 'pdf' | 'json' | 'youtube';
  name: string;
  description: string;
  status: 'ready' | 'generating' | 'completed' | 'failed';
  size?: string;
  createdAt?: string;
}

export function ExportsPanel({ videoId }: ExportsPanelProps) {
  const [exports, setExports] = useState<Export[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    const mockExports: Export[] = [
      {
        id: '1',
        type: 'srt',
        name: 'Subtitles (SRT)',
        description: 'Standard subtitle format for video players',
        status: 'completed',
        size: '12.5 KB',
        createdAt: '2024-12-19T10:30:00Z'
      },
      {
        id: '2',
        type: 'vtt',
        name: 'WebVTT',
        description: 'Web Video Text Tracks format for HTML5 video',
        status: 'completed',
        size: '15.2 KB',
        createdAt: '2024-12-19T10:31:00Z'
      },
      {
        id: '3',
        type: 'md',
        name: 'Markdown Summary',
        description: 'Formatted summary in Markdown',
        status: 'completed',
        size: '8.7 KB',
        createdAt: '2024-12-19T10:32:00Z'
      },
      {
        id: '4',
        type: 'pdf',
        name: 'PDF Report',
        description: 'Complete analysis report in PDF format',
        status: 'generating',
        size: undefined,
        createdAt: '2024-12-19T10:33:00Z'
      },
      {
        id: '5',
        type: 'json',
        name: 'JSON Data',
        description: 'Structured data export for API integration',
        status: 'ready'
      },
      {
        id: '6',
        type: 'youtube',
        name: 'YouTube Chapters',
        description: 'Copy chapters to YouTube description',
        status: 'ready'
      }
    ];

    setExports(mockExports);
    setIsLoading(false);
  }, [videoId]);

  const getTypeIcon = (type: Export['type']) => {
    switch (type) {
      case 'srt':
      case 'vtt':
        return <FileVideo className="h-4 w-4" />;
      case 'md':
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'json':
        return <FileCode className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Export['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateExport = (exportId: string) => {
    setExports(exports.map(exp =>
      exp.id === exportId ? { ...exp, status: 'generating' as const } : exp
    ));

    // Simulate generation
    setTimeout(() => {
      setExports(exports.map(exp =>
        exp.id === exportId ? { 
          ...exp, 
          status: 'completed' as const,
          size: 'Generated',
          createdAt: new Date().toISOString()
        } : exp
      ));
      toast({
        title: 'Export completed',
        description: 'Your export has been generated successfully.',
      });
    }, 2000);
  };

  const handleDownloadExport = (exportItem: Export) => {
    toast({
      title: 'Download started',
      description: `${exportItem.name} is being downloaded.`,
    });
  };

  const handleCopyToClipboard = (exportItem: Export) => {
    if (exportItem.type === 'youtube') {
      const chaptersText = `00:00 Introduction to AI
02:00 Machine Learning Fundamentals
05:00 Deep Learning Applications
08:00 Future Trends and Challenges`;

      navigator.clipboard.writeText(chaptersText);
      toast({
        title: 'Copied to clipboard',
        description: 'YouTube chapters copied to clipboard.',
      });
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
        <h3 className="font-semibold text-lg mb-2">Export Options</h3>
        <p className="text-sm text-muted-foreground">
          Generate and download various formats of your video analysis
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {exports.map((exportItem) => (
            <div
              key={exportItem.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(exportItem.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{exportItem.name}</h4>
                    <Badge className={cn("text-xs", getStatusColor(exportItem.status))}>
                      {exportItem.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {exportItem.description}
                  </p>

                  {exportItem.size && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Size: {exportItem.size}
                      {exportItem.createdAt && (
                        <span className="ml-4">
                          Created: {new Date(exportItem.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    {exportItem.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateExport(exportItem.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    )}

                    {exportItem.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleDownloadExport(exportItem)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}

                    {exportItem.status === 'generating' && (
                      <Button
                        size="sm"
                        disabled
                        className="animate-pulse"
                      >
                        <div className="h-3 w-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </Button>
                    )}

                    {exportItem.type === 'youtube' && exportItem.status === 'ready' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(exportItem)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Chapters
                      </Button>
                    )}

                    {exportItem.type === 'youtube' && exportItem.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(exportItem)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{exports.filter(e => e.status === 'completed').length} of {exports.length} exports ready</span>
          <span>{exports.filter(e => e.status === 'generating').length} generating</span>
        </div>
      </div>
    </div>
  );
}
