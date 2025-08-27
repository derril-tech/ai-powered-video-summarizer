// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { Search, Play, Clock, FileVideo, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  videoId: string;
  videoTitle: string;
  snippet: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speaker?: string;
  relevance: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const router = useRouter();

  const filters = [
    { id: 'high-confidence', label: 'High Confidence', color: 'bg-green-100 text-green-800' },
    { id: 'recent', label: 'Recent Videos', color: 'bg-blue-100 text-blue-800' },
    { id: 'speakers', label: 'Multiple Speakers', color: 'bg-purple-100 text-purple-800' },
  ];

  // Mock search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          videoId: 'video-1',
          videoTitle: 'Introduction to Artificial Intelligence',
          snippet: '...artificial intelligence and machine learning are transforming industries across the globe...',
          startTime: 120,
          endTime: 180,
          confidence: 0.95,
          speaker: 'Dr. Smith',
          relevance: 0.92
        },
        {
          id: '2',
          videoId: 'video-2',
          videoTitle: 'Deep Learning Fundamentals',
          snippet: '...neural networks and deep learning algorithms can process vast amounts of data...',
          startTime: 300,
          endTime: 360,
          confidence: 0.88,
          speaker: 'Prof. Johnson',
          relevance: 0.89
        },
        {
          id: '3',
          videoId: 'video-1',
          videoTitle: 'Introduction to Artificial Intelligence',
          snippet: '...the future of AI holds tremendous potential for solving complex problems...',
          startTime: 480,
          endTime: 540,
          confidence: 0.91,
          speaker: 'Dr. Smith',
          relevance: 0.85
        },
        {
          id: '4',
          videoId: 'video-3',
          videoTitle: 'Machine Learning Applications',
          snippet: '...machine learning models are being deployed in production systems worldwide...',
          startTime: 240,
          endTime: 300,
          confidence: 0.87,
          speaker: 'Dr. Brown',
          relevance: 0.83
        }
      ];

      setResults(mockResults);
      setIsLoading(false);
    }, 500);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered by useEffect when query changes
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/workspace/${result.videoId}?seek=${result.startTime}`);
  };

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    if (confidence >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.9) return 'bg-green-100 text-green-800';
    if (relevance >= 0.8) return 'bg-blue-100 text-blue-800';
    if (relevance >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Videos</h1>
        <p className="text-muted-foreground">
          Search across all your video transcripts with semantic understanding
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for concepts, topics, or specific phrases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
          />
        </div>
      </form>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterToggle(filter.id)}
              className={cn(
                selectedFilters.includes(filter.id) && filter.color
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {!isLoading && results.map((result) => (
          <Card 
            key={result.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleResultClick(result)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileVideo className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold truncate">{result.videoTitle}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(result.startTime)}</span>
                    </div>
                    {result.speaker && (
                      <span>Speaker: {result.speaker}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className={cn("text-xs", getConfidenceColor(result.confidence))}>
                        {Math.round(result.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getRelevanceColor(result.relevance))}>
                    {Math.round(result.relevance * 100)}% match
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed">
                {result.snippet}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3 mr-1" />
                  Play from {formatDuration(result.startTime)}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workspace/${result.videoId}`);
                  }}
                >
                  View Video
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Tips */}
      {!query && (
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Natural Language</h4>
              <p className="text-sm text-muted-foreground">
                Use natural phrases like "machine learning applications" or "AI ethics discussion"
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Concept Search</h4>
              <p className="text-sm text-muted-foreground">
                Search for concepts even if the exact words aren't used in the transcript
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Speaker Filter</h4>
              <p className="text-sm text-muted-foreground">
                Use filters to find content from specific speakers or time periods
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
