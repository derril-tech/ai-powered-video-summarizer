// Created automatically by Cursor AI (2024-12-19)
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, Play, Edit, Trash2, Reply, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  text: string;
  timestamp: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  type: 'comment' | 'suggestion' | 'question' | 'correction';
  status: 'active' | 'resolved' | 'archived';
  replies: Reply[];
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  isEditing?: boolean;
}

interface Reply {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  dislikes: number;
}

interface CommentsPanelProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function CommentsPanel({ videoId, currentTime, onSeek }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('comment');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        text: 'Great explanation of neural networks! The visual examples really help clarify the concepts.',
        timestamp: 120,
        author: {
          id: 'user1',
          name: 'Alice Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
        },
        createdAt: '2024-12-19T10:30:00Z',
        type: 'comment',
        status: 'active',
        replies: [
          {
            id: 'reply1',
            text: 'I agree! The diagrams made it much easier to understand.',
            author: {
              id: 'user2',
              name: 'Bob Smith',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
            },
            createdAt: '2024-12-19T10:35:00Z',
            likes: 2,
            dislikes: 0
          }
        ],
        likes: 5,
        dislikes: 0,
        userLiked: true
      },
      {
        id: '2',
        text: 'Consider adding more examples of real-world applications of machine learning.',
        timestamp: 300,
        author: {
          id: 'user3',
          name: 'Carol Davis',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol'
        },
        createdAt: '2024-12-19T11:00:00Z',
        type: 'suggestion',
        status: 'active',
        replies: [],
        likes: 3,
        dislikes: 1
      },
      {
        id: '3',
        text: 'What are the main differences between supervised and unsupervised learning?',
        timestamp: 180,
        author: {
          id: 'user4',
          name: 'David Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
        },
        createdAt: '2024-12-19T11:15:00Z',
        type: 'question',
        status: 'active',
        replies: [
          {
            id: 'reply2',
            text: 'Supervised learning uses labeled data, while unsupervised learning finds patterns in unlabeled data.',
            author: {
              id: 'user1',
              name: 'Alice Johnson',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
            },
            createdAt: '2024-12-19T11:20:00Z',
            likes: 4,
            dislikes: 0
          }
        ],
        likes: 2,
        dislikes: 0
      },
      {
        id: '4',
        text: 'There\'s a small error in the explanation of backpropagation at this timestamp.',
        timestamp: 420,
        author: {
          id: 'user5',
          name: 'Eve Brown',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve'
        },
        createdAt: '2024-12-19T11:30:00Z',
        type: 'correction',
        status: 'resolved',
        replies: [],
        likes: 1,
        dislikes: 0
      }
    ];

    setComments(mockComments);
  }, [videoId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      timestamp: currentTime,
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current'
      },
      createdAt: new Date().toISOString(),
      type: commentType,
      status: 'active',
      replies: [],
      likes: 0,
      dislikes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const reply: Reply = {
      id: `reply-${Date.now()}`,
      text: replyText,
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    };

    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyText('');
    setReplyingTo(null);
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
            dislikes: comment.userDisliked ? comment.dislikes - 1 : comment.dislikes,
            userLiked: !comment.userLiked,
            userDisliked: false
          }
        : comment
    ));
  };

  const handleDislike = (commentId: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            dislikes: comment.userDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
            likes: comment.userLiked ? comment.likes - 1 : comment.likes,
            userDisliked: !comment.userDisliked,
            userLiked: false
          }
        : comment
    ));
  };

  const handleEditComment = (commentId: string, newText: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, text: newText, updatedAt: new Date().toISOString(), isEditing: false }
        : comment
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const getTypeColor = (type: Comment['type']) => {
    switch (type) {
      case 'comment': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-yellow-100 text-yellow-800';
      case 'correction': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComments = comments.filter(comment => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'comments') return comment.type === 'comment';
    if (selectedFilter === 'suggestions') return comment.type === 'suggestion';
    if (selectedFilter === 'questions') return comment.type === 'question';
    if (selectedFilter === 'corrections') return comment.type === 'correction';
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-4">Comments & Suggestions</h3>
        
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'comments', label: 'Comments' },
            { id: 'suggestions', label: 'Suggestions' },
            { id: 'questions', label: 'Questions' },
            { id: 'corrections', label: 'Corrections' }
          ].map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Add Comment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as Comment['type'])}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="comment">Comment</option>
              <option value="suggestion">Suggestion</option>
              <option value="question">Question</option>
              <option value="correction">Correction</option>
            </select>
            <span className="text-sm text-muted-foreground">
              at {formatDuration(currentTime)}
            </span>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment, suggestion, or question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              rows={3}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <Badge className={cn("text-xs", getTypeColor(comment.type))}>
                        {comment.type}
                      </Badge>
                      {comment.status !== 'active' && (
                        <Badge className={cn("text-xs", getStatusColor(comment.status))}>
                          {comment.status}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSeek(comment.timestamp)}
                        className="h-auto p-1 text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(comment.timestamp)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSeek(comment.timestamp)}
                        className="h-auto p-1 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Jump to
                      </Button>
                    </div>

                    <p className="text-sm mb-3">{comment.text}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(comment.id)}
                          className={cn("h-auto p-1", comment.userLiked && "text-blue-600")}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDislike(comment.id)}
                          className={cn("h-auto p-1", comment.userDisliked && "text-red-600")}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          {comment.dislikes}
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="h-auto p-1"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>

                      {comment.author.id === 'current-user' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setComments(comments.map(c =>
                                c.id === comment.id ? { ...c, isEditing: !c.isEditing } : c
                              ));
                            }}
                            className="h-auto p-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-auto p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-4 pl-4 border-l-2 border-muted">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.author.avatar} />
                                <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{reply.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{reply.text}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>👍 {reply.likes}</span>
                              <span>👎 {reply.dislikes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredComments.length} comments</span>
          <span>{comments.reduce((sum, comment) => sum + comment.replies.length, 0)} replies</span>
        </div>
      </div>
    </div>
  );
}
