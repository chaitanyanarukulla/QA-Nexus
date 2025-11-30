'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Clock, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createReview, getReviews, updateReviewStatus, type ReviewStatus, type ReviewDecision } from '@/app/actions/reviews'

interface Review {
  id: string
  status: ReviewStatus
  decision: ReviewDecision | null
  comments: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  creator: {
    id: string
    name: string | null
    email: string
  }
  assignee: {
    id: string
    name: string | null
    email: string
  }
  testCase?: {
    id: string
    title: string
  } | null
  testSuite?: {
    id: string
    title: string
  } | null
}

interface User {
  id: string
  name: string | null
  email: string
}

interface ReviewPanelProps {
  testCaseId?: string
  testSuiteId?: string
  currentUserId: string
  users: User[]
}

export function ReviewPanel({ testCaseId, testSuiteId, currentUserId, users }: ReviewPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision | ''>('')
  const [reviewComments, setReviewComments] = useState('')

  useEffect(() => {
    loadReviews()
  }, [testCaseId, testSuiteId])

  const loadReviews = async () => {
    const result = await getReviews({ testCaseId, testSuiteId })
    if (result.success && result.reviews) {
      setReviews(result.reviews as any)
    }
  }

  const handleRequestReview = async () => {
    if (!selectedUser) {
      toast.error('Please select a reviewer')
      return
    }

    setLoading(true)
    const result = await createReview({
      testCaseId,
      testSuiteId,
      createdBy: currentUserId,
      assignedTo: selectedUser,
      comments,
    })

    if (result.success) {
      setOpen(false)
      setSelectedUser('')
      setComments('')
      await loadReviews()
      toast.success('Review requested')
    } else {
      toast.error('Failed to request review')
    }
    setLoading(false)
  }

  const handleCompleteReview = async (reviewId: string) => {
    if (!reviewDecision) {
      toast.error('Please select a decision')
      return
    }

    setLoading(true)
    const result = await updateReviewStatus({
      reviewId,
      status: 'COMPLETED',
      decision: reviewDecision as ReviewDecision,
      comments: reviewComments || undefined,
    })

    if (result.success) {
      setReviewingId(null)
      setReviewDecision('')
      setReviewComments('')
      await loadReviews()
      toast.success('Review completed')
    } else {
      toast.error('Failed to complete review')
    }
    setLoading(false)
  }

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'IN_REVIEW':
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />In Review</Badge>
      case 'COMPLETED':
        return <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="danger"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
    }
  }

  const getDecisionBadge = (decision: ReviewDecision | null) => {
    if (!decision) return null

    switch (decision) {
      case 'APPROVED':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="danger"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'NEEDS_CHANGES':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Needs Changes</Badge>
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const canReview = (review: Review) => {
    return review.assignee.id === currentUserId && review.status !== 'COMPLETED' && review.status !== 'CANCELLED'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Reviews ({reviews.length})
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Request Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Review</DialogTitle>
                <DialogDescription>
                  Select a team member to review this {testCaseId ? 'test case' : 'test suite'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reviewer</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.id !== currentUserId).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments (optional)</label>
                  <Textarea
                    placeholder="Add any notes for the reviewer..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestReview} disabled={loading}>
                  Request Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(review.assignee.name, review.assignee.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {review.assignee.name || review.assignee.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested by {review.creator.name || review.creator.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(review.status)}
                    {getDecisionBadge(review.decision)}
                  </div>
                </div>

                {review.comments && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    <p className="font-medium mb-1">Request Comments:</p>
                    {review.comments}
                  </div>
                )}

                {canReview(review) && reviewingId !== review.id && (
                  <Button
                    size="sm"
                    onClick={() => setReviewingId(review.id)}
                  >
                    Complete Review
                  </Button>
                )}

                {reviewingId === review.id && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Decision</label>
                      <Select value={reviewDecision} onValueChange={(value) => setReviewDecision(value as ReviewDecision)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPROVED">Approve</SelectItem>
                          <SelectItem value="NEEDS_CHANGES">Request Changes</SelectItem>
                          <SelectItem value="REJECTED">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review Comments</label>
                      <Textarea
                        placeholder="Add your review comments..."
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteReview(review.id)}
                        disabled={loading}
                      >
                        Submit Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReviewingId(null)
                          setReviewDecision('')
                          setReviewComments('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
