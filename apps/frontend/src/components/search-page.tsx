// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Clock, Play, FileText, MessageSquare, Star, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { formatDuration, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'transcript' | 'summary' | 'highlight' | 'comment' | 'chapter';
  videoId: string;
  videoTitle: string;
  videoThumbnail?: string;
  content: string;
  timestamp: number;
  duration?: number;
  confidence?: number;
  relevance: number;
  tags: string[];
  author?: string;
  createdAt: string;
  metadata?: {
    speaker?: string;
    chapter?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    entities?: string[];
  };
}

interface SearchFilters {
  types: string[];
  dateRange: [Date | null, Date | null];
  durationRange: [number, number];
  confidenceRange: [number, number];
  speakers: string[];
  chapters: string[];
  tags: string[];
  sentiment: string[];
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateRange: [null, null],
    durationRange: [0, 100],
    confidenceRange: [0, 100],
    speakers: [],
    chapters: [],
    tags: [],
    sentiment: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'duration'>('relevance');

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'transcript',
      videoId: 'video1',
      videoTitle: 'Introduction to Machine Learning',
      content: 'Neural networks are a fundamental concept in deep learning that mimic the human brain structure.',
      timestamp: 120,
      duration: 15,
      confidence: 0.95,
      relevance: 0.92,
      tags: ['machine learning', 'neural networks', 'deep learning'],
      author: 'Dr. Smith',
      createdAt: '2024-12-19T10:00:00Z',
      metadata: {
        speaker: 'Dr. Smith',
        chapter: 'Neural Networks',
        sentiment: 'positive',
        entities: ['neural networks', 'deep learning', 'human brain']
      }
    },
    {
      id: '2',
      type: 'summary',
      videoId: 'video1',
      videoTitle: 'Introduction to Machine Learning',
      content: 'This chapter covers the basics of neural networks and their applications in modern AI systems.',
      timestamp: 300,
      duration: 45,
      confidence: 0.88,
      relevance: 0.89,
      tags: ['summary', 'neural networks', 'AI'],
      createdAt: '2024-12-19T10:05:00Z',
      metadata: {
        chapter: 'Neural Networks',
        sentiment: 'neutral'
      }
    },
    {
      id: '3',
      type: 'highlight',
      videoId: 'video1',
      videoTitle: 'Introduction to Machine Learning',
      content: 'The key insight is that neural networks can learn complex patterns through multiple layers of processing.',
      timestamp: 180,
      duration: 8,
      confidence: 0.91,
      relevance: 0.87,
      tags: ['highlight', 'key insight', 'patterns'],
      createdAt: '2024-12-19T10:10:00Z',
      metadata: {
        speaker: 'Dr. Smith',
        sentiment: 'positive'
      }
    },
    {
      id: '4',
      type: 'comment',
      videoId: 'video1',
      videoTitle: 'Introduction to Machine Learning',
      content: 'Great explanation of neural networks! The visual examples really help clarify the concepts.',
      timestamp: 120,
      relevance: 0.85,
      tags: ['comment', 'feedback'],
      author: 'Alice Johnson',
      createdAt: '2024-12-19T10:30:00Z',
      metadata: {
        sentiment: 'positive'
      }
    },
    {
      id: '5',
      type: 'chapter',
      videoId: 'video1',
      videoTitle: 'Introduction to Machine Learning',
      content: 'Chapter 3: Neural Networks and Deep Learning - This chapter explores the fundamental concepts of neural networks.',
      timestamp: 300,
      duration: 600,
      relevance: 0.83,
      tags: ['chapter', 'neural networks', 'deep learning'],
      createdAt: '2024-12-19T09:00:00Z',
      metadata: {
        chapter: 'Neural Networks and Deep Learning'
      }
    }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock results based on query
    const filtered = mockResults.filter(result =>
      result.content.toLowerCase().includes(query.toLowerCase()) ||
      result.videoTitle.toLowerCase().includes(query.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredResults = useMemo(() => {
    let filtered = searchResults;

    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(result => filters.types.includes(result.type));
    }

    // Apply duration filter
    filtered = filtered.filter(result => {
      if (!result.duration) return true;
      return result.duration >= filters.durationRange[0] && result.duration <= filters.durationRange[1];
    });

    // Apply confidence filter
    filtered = filtered.filter(result => {
      if (!result.confidence) return true;
      return result.confidence >= filters.confidenceRange[0] / 100 && result.confidence <= filters.confidenceRange[1] / 100;
    });

    // Apply speaker filter
    if (filters.speakers.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.speaker && filters.speakers.includes(result.metadata.speaker)
      );
    }

    // Apply sentiment filter
    if (filters.sentiment.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.sentiment && filters.sentiment.includes(result.metadata.sentiment)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance - a.relevance;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchResults, filters, sortBy]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'transcript': return <FileText className="h-4 w-4" />;
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'highlight': return <Star className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'chapter': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'transcript': return 'bg-blue-100 text-blue-800';
      case 'summary': return 'bg-green-100 text-green-800';
      case 'highlight': return 'bg-yellow-100 text-yellow-800';
      case 'comment': return 'bg-purple-100 text-purple-800';
      case 'chapter': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSeekToTimestamp = (videoId: string, timestamp: number) => {
    // Navigate to video with timestamp
    console.log(`Seeking to ${timestamp}s in video ${videoId}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-6">Search Videos</h1>
        
        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transcripts, summaries, highlights, comments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary text-primary-foreground")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Content Types */}
                <div>
                  <h4 className="font-medium mb-3">Content Types</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'transcript', label: 'Transcripts' },
                      { id: 'summary', label: 'Summaries' },
                      { id: 'highlight', label: 'Highlights' },
                      { id: 'comment', label: 'Comments' },
                      { id: 'chapter', label: 'Chapters' }
                    ].map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={filters.types.includes(type.id)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              types: checked
                                ? [...prev.types, type.id]
                                : prev.types.filter(t => t !== type.id)
                            }));
                          }}
                        />
                        <label htmlFor={type.id} className="text-sm">{type.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration Range */}
                <div>
                  <h4 className="font-medium mb-3">Duration (seconds)</h4>
                  <div className="space-y-4">
                    <Slider
                      value={filters.durationRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, durationRange: value as [number, number] }))}
                      max={300}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{filters.durationRange[0]}s</span>
                      <span>{filters.durationRange[1]}s</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Range */}
                <div>
                  <h4 className="font-medium mb-3">Confidence (%)</h4>
                  <div className="space-y-4">
                    <Slider
                      value={filters.confidenceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, confidenceRange: value as [number, number] }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{filters.confidenceRange[0]}%</span>
                      <span>{filters.confidenceRange[1]}%</span>
                    </div>
                  </div>
                </div>

                {/* Sentiment */}
                <div>
                  <h4 className="font-medium mb-3">Sentiment</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'positive', label: 'Positive' },
                      { id: 'negative', label: 'Negative' },
                      { id: 'neutral', label: 'Neutral' }
                    ].map((sentiment) => (
                      <div key={sentiment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={sentiment.id}
                          checked={filters.sentiment.includes(sentiment.id)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              sentiment: checked
                                ? [...prev.sentiment, sentiment.id]
                                : prev.sentiment.filter(s => s !== sentiment.id)
                            }));
                          }}
                        />
                        <label htmlFor={sentiment.id} className="text-sm">{sentiment.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'duration')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredResults.length} results
          </span>
        </div>
      </div>

      {/* Search Results */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {result.videoThumbnail ? (
                      <img
                        src={result.videoThumbnail}
                        alt={result.videoTitle}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                        {getTypeIcon(result.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs", getTypeColor(result.type))}>
                        {result.type}
                      </Badge>
                      <span className="font-medium text-sm">{result.videoTitle}</span>
                      {result.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{result.content}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(result.timestamp)}
                      </div>
                      {result.duration && (
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {formatDuration(result.duration)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.createdAt)}
                      </div>
                      {result.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {result.author}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSeekToTimestamp(result.videoId, result.timestamp)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Jump to
                        </Button>
                      </div>
                    </div>

                    {/* Metadata */}
                    {result.metadata && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {result.metadata.speaker && (
                            <span>Speaker: {result.metadata.speaker}</span>
                          )}
                          {result.metadata.chapter && (
                            <span>Chapter: {result.metadata.chapter}</span>
                          )}
                          {result.metadata.sentiment && (
                            <span>Sentiment: {result.metadata.sentiment}</span>
                          )}
                        </div>
                        {result.metadata.entities && result.metadata.entities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Entities: </span>
                            {result.metadata.entities.map((entity, index) => (
                              <Badge key={entity} variant="outline" className="text-xs mr-1">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredResults.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
