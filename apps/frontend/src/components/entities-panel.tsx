// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Building, MapPin, Calendar, Hash, TrendingUp, Clock, Play, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatDuration, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Entity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'technology' | 'concept' | 'product';
  frequency: number;
  confidence: number;
  firstMention: number;
  lastMention: number;
  mentions: EntityMention[];
  relatedEntities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  description?: string;
}

interface EntityMention {
  id: string;
  timestamp: number;
  context: string;
  confidence: number;
  speaker?: string;
}

interface EntitiesPanelProps {
  videoId: string;
  onSeek: (time: number) => void;
}

export function EntitiesPanel({ videoId, onSeek }: EntitiesPanelProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'confidence' | 'firstMention'>('frequency');

  // Mock entities data
  useEffect(() => {
    const mockEntities: Entity[] = [
      {
        id: '1',
        name: 'Neural Networks',
        type: 'technology',
        frequency: 15,
        confidence: 0.95,
        firstMention: 120,
        lastMention: 1800,
        sentiment: 'positive',
        description: 'Artificial neural networks that mimic biological neural networks',
        mentions: [
          {
            id: 'mention1',
            timestamp: 120,
            context: 'Neural networks are a fundamental concept in deep learning',
            confidence: 0.95,
            speaker: 'Dr. Smith'
          },
          {
            id: 'mention2',
            timestamp: 300,
            context: 'The neural network architecture consists of multiple layers',
            confidence: 0.92,
            speaker: 'Dr. Smith'
          },
          {
            id: 'mention3',
            timestamp: 450,
            context: 'We can train neural networks using backpropagation',
            confidence: 0.88,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Deep Learning', 'Backpropagation', 'Machine Learning']
      },
      {
        id: '2',
        name: 'Dr. Smith',
        type: 'person',
        frequency: 8,
        confidence: 0.98,
        firstMention: 0,
        lastMention: 1800,
        sentiment: 'positive',
        mentions: [
          {
            id: 'mention4',
            timestamp: 0,
            context: 'Hello, I\'m Dr. Smith and today we\'ll discuss machine learning',
            confidence: 0.98,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Machine Learning', 'Neural Networks']
      },
      {
        id: '3',
        name: 'Machine Learning',
        type: 'concept',
        frequency: 12,
        confidence: 0.93,
        firstMention: 30,
        lastMention: 1650,
        sentiment: 'positive',
        description: 'A subset of artificial intelligence that enables systems to learn from data',
        mentions: [
          {
            id: 'mention5',
            timestamp: 30,
            context: 'Machine learning is transforming how we approach problem-solving',
            confidence: 0.93,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Neural Networks', 'Deep Learning', 'AI']
      },
      {
        id: '4',
        name: 'Deep Learning',
        type: 'concept',
        frequency: 10,
        confidence: 0.91,
        firstMention: 180,
        lastMention: 1500,
        sentiment: 'positive',
        description: 'A subset of machine learning using neural networks with multiple layers',
        mentions: [
          {
            id: 'mention6',
            timestamp: 180,
            context: 'Deep learning has revolutionized computer vision and NLP',
            confidence: 0.91,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Neural Networks', 'Machine Learning', 'Computer Vision']
      },
      {
        id: '5',
        name: 'Backpropagation',
        type: 'concept',
        frequency: 6,
        confidence: 0.89,
        firstMention: 600,
        lastMention: 1200,
        sentiment: 'neutral',
        description: 'Algorithm for training neural networks by computing gradients',
        mentions: [
          {
            id: 'mention7',
            timestamp: 600,
            context: 'Backpropagation allows us to update the network weights efficiently',
            confidence: 0.89,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Neural Networks', 'Gradient Descent']
      },
      {
        id: '6',
        name: 'Computer Vision',
        type: 'technology',
        frequency: 4,
        confidence: 0.87,
        firstMention: 900,
        lastMention: 1350,
        sentiment: 'positive',
        description: 'Field of AI that enables computers to interpret visual information',
        mentions: [
          {
            id: 'mention8',
            timestamp: 900,
            context: 'Computer vision applications include image recognition and object detection',
            confidence: 0.87,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Deep Learning', 'Image Recognition']
      },
      {
        id: '7',
        name: 'Natural Language Processing',
        type: 'technology',
        frequency: 5,
        confidence: 0.85,
        firstMention: 1050,
        lastMention: 1500,
        sentiment: 'positive',
        description: 'Field of AI focused on enabling computers to understand human language',
        mentions: [
          {
            id: 'mention9',
            timestamp: 1050,
            context: 'NLP has made significant progress with transformer models',
            confidence: 0.85,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['Deep Learning', 'Transformers']
      },
      {
        id: '8',
        name: '2024',
        type: 'date',
        frequency: 3,
        confidence: 0.99,
        firstMention: 300,
        lastMention: 300,
        sentiment: 'neutral',
        mentions: [
          {
            id: 'mention10',
            timestamp: 300,
            context: 'In 2024, we\'ve seen remarkable advances in AI technology',
            confidence: 0.99,
            speaker: 'Dr. Smith'
          }
        ],
        relatedEntities: ['AI Technology', 'Advances']
      }
    ];

    setEntities(mockEntities);
  }, [videoId]);

  const getTypeIcon = (type: Entity['type']) => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />;
      case 'organization': return <Building className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'technology': return <Hash className="h-4 w-4" />;
      case 'concept': return <Hash className="h-4 w-4" />;
      case 'product': return <Hash className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Entity['type']) => {
    switch (type) {
      case 'person': return 'bg-blue-100 text-blue-800';
      case 'organization': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-yellow-100 text-yellow-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      case 'technology': return 'bg-orange-100 text-orange-800';
      case 'concept': return 'bg-indigo-100 text-indigo-800';
      case 'product': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: Entity['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedEntities = useMemo(() => {
    let filtered = entities;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(entity => entity.type === filterType);
    }

    // Sort entities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'firstMention':
          return a.firstMention - b.firstMention;
        default:
          return 0;
      }
    });

    return filtered;
  }, [entities, filterType, sortBy]);

  const entityTypes = [
    { id: 'all', label: 'All Types', count: entities.length },
    { id: 'person', label: 'People', count: entities.filter(e => e.type === 'person').length },
    { id: 'organization', label: 'Organizations', count: entities.filter(e => e.type === 'organization').length },
    { id: 'location', label: 'Locations', count: entities.filter(e => e.type === 'location').length },
    { id: 'date', label: 'Dates', count: entities.filter(e => e.type === 'date').length },
    { id: 'technology', label: 'Technologies', count: entities.filter(e => e.type === 'technology').length },
    { id: 'concept', label: 'Concepts', count: entities.filter(e => e.type === 'concept').length },
    { id: 'product', label: 'Products', count: entities.filter(e => e.type === 'product').length }
  ];

  const totalMentions = entities.reduce((sum, entity) => sum + entity.frequency, 0);
  const averageConfidence = entities.reduce((sum, entity) => sum + entity.confidence, 0) / entities.length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-4">Named Entities</h3>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Entities</p>
                  <p className="text-lg font-semibold">{entities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mentions</p>
                  <p className="text-lg font-semibold">{totalMentions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <p className="text-lg font-semibold">{Math.round(averageConfidence * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <div className="flex gap-2">
            {entityTypes.map((type) => (
              <Button
                key={type.id}
                variant={filterType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type.id)}
              >
                {type.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {type.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'frequency' | 'confidence' | 'firstMention')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="frequency">Frequency</option>
            <option value="confidence">Confidence</option>
            <option value="firstMention">First Mention</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Entities List */}
        <div className="w-1/2 border-r">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {filteredAndSortedEntities.map((entity) => (
                <Card
                  key={entity.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedEntity?.id === entity.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedEntity(entity)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(entity.type)}
                          <span className="font-medium">{entity.name}</span>
                          <Badge className={cn("text-xs", getTypeColor(entity.type))}>
                            {entity.type}
                          </Badge>
                          <Badge className={cn("text-xs", getSentimentColor(entity.sentiment))}>
                            {entity.sentiment}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Frequency: {entity.frequency}</span>
                          <span>Confidence: {Math.round(entity.confidence * 100)}%</span>
                          <span>First: {formatDuration(entity.firstMention)}</span>
                        </div>

                        {entity.description && (
                          <p className="text-sm text-muted-foreground">{entity.description}</p>
                        )}

                        {entity.relatedEntities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Related: </span>
                            {entity.relatedEntities.slice(0, 3).map((related, index) => (
                              <Badge key={related} variant="outline" className="text-xs mr-1">
                                {related}
                              </Badge>
                            ))}
                            {entity.relatedEntities.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{entity.relatedEntities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <Progress value={entity.confidence * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Entity Details */}
        <div className="w-1/2">
          {selectedEntity ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedEntity.type)}
                  <h4 className="font-semibold text-lg">{selectedEntity.name}</h4>
                  <Badge className={cn("text-xs", getTypeColor(selectedEntity.type))}>
                    {selectedEntity.type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="ml-2 font-medium">{selectedEntity.frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-2 font-medium">{Math.round(selectedEntity.confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First Mention:</span>
                    <span className="ml-2 font-medium">{formatDuration(selectedEntity.firstMention)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Mention:</span>
                    <span className="ml-2 font-medium">{formatDuration(selectedEntity.lastMention)}</span>
                  </div>
                </div>

                {selectedEntity.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedEntity.description}</p>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <h5 className="font-medium mb-3">Mentions ({selectedEntity.mentions.length})</h5>
                  <div className="space-y-3">
                    {selectedEntity.mentions.map((mention) => (
                      <Card key={mention.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSeek(mention.timestamp)}
                                className="h-auto p-1 text-xs"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(mention.timestamp)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSeek(mention.timestamp)}
                                className="h-auto p-1 text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Jump
                              </Button>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(mention.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm">{mention.context}</p>
                          {mention.speaker && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Speaker: {mention.speaker}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedEntity.relatedEntities.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium mb-3">Related Entities</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntity.relatedEntities.map((related) => (
                          <Badge key={related} variant="secondary">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an entity to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
