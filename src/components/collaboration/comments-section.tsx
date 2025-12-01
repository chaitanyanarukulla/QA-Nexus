'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Reply, Trash2, Edit2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createComment, getComments, updateComment, deleteComment } from '@/app/actions/comments'

interface Comment {
  id: string
  content: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  replies?: Comment[]
}

interface CommentsSectionProps {
  testCaseId?: string
  testSuiteId?: string
  defectId?: string
  currentUserId: string
}

export function CommentsSection({ testCaseId, testSuiteId, defectId, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadComments()
  }, [testCaseId, testSuiteId, defectId])

  const loadComments = async () => {
    const result = await getComments({ testCaseId, testSuiteId, defectId })
    if (result.success && result.comments) {
      setComments(result.comments)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    const result = await createComment({
      content: newComment,
      userId: currentUserId,
      testCaseId,
      testSuiteId,
      defectId,
    })

    if (result.success) {
      setNewComment('')
      await loadComments()
      toast.success('Comment added')
    } else {
      toast.error('Failed to add comment')
    }
    setLoading(false)
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setLoading(true)
    const result = await createComment({
      content: replyContent,
      userId: currentUserId,
      testCaseId,
      testSuiteId,
      defectId,
      parentId,
    })

    if (result.success) {
      setReplyContent('')
      setReplyTo(null)
      await loadComments()
      toast.success('Reply added')
    } else {
      toast.error('Failed to add reply')
    }
    setLoading(false)
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    setLoading(true)
    const result = await updateComment({
      commentId,
      content: editContent,
    })

    if (result.success) {
      setEditContent('')
      setEditingId(null)
      await loadComments()
      toast.success('Comment updated')
    } else {
      toast.error('Failed to update comment')
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setLoading(true)
    const result = await deleteComment({ commentId })

    if (result.success) {
      await loadComments()
      toast.success('Comment deleted')
    } else {
      toast.error('Failed to delete comment')
    }
    setLoading(false)
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
              <div className="flex flex-row items-center gap-2">
                <Send className="h-4 w-4" />
                <span>Comment</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Main Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.user.name, comment.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {comment.user.name || comment.user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(comment.id)} disabled={loading}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyTo(comment.id)}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <Reply className="h-3 w-3" />
                            <span>Reply</span>
                          </div>
                        </Button>
                        {comment.userId === currentUserId && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(comment)}
                            >
                              <div className="flex flex-row items-center gap-2">
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                              </div>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <div className="flex flex-row items-center gap-2">
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </div>
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="ml-11 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(comment.id)}
                      disabled={loading || !replyContent.trim()}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Send className="h-3 w-3" />
                        <span>Reply</span>
                      </div>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-3 pt-2 border-l-2 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(reply.user.name, reply.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">
                            {reply.user.name || reply.user.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        {reply.userId === currentUserId && (
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => handleDelete(reply.id)}
                            >
                              <div className="flex flex-row items-center gap-2">
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </div>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
