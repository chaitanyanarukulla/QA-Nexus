'use server'

import { prisma } from '@/lib/prisma'
import type { ReviewStatus, ReviewDecision } from '@prisma/client'
import { createNotification } from './notifications'
import { logActivity } from './activity'

export async function createReview({
  testCaseId,
  testSuiteId,
  createdBy,
  assignedTo,
  comments,
}: {
  testCaseId?: string
  testSuiteId?: string
  createdBy: string
  assignedTo: string
  comments?: string
}) {
  try {
    const review = await prisma.review.create({
      data: {
        testCaseId,
        testSuiteId,
        createdBy,
        assignedTo,
        comments,
        status: 'PENDING',
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Create notification for assignee
    const entityTitle = review.testCase?.title || review.testSuite?.title || 'Unknown'
    const entityType = testCaseId ? 'test_case' : 'test_suite'
    const entityId = testCaseId || testSuiteId

    await createNotification({
      userId: assignedTo,
      type: 'REVIEW_REQUESTED',
      title: 'Review requested',
      message: `${review.creator.name || review.creator.email} requested your review on "${entityTitle}"`,
      entityType,
      entityId,
    })

    // Log activity
    if (entityId) {
      await logActivity({
        userId: createdBy,
        action: 'requested_review',
        entityType,
        entityId,
        entityTitle,
      })
    }

    return { success: true, review }
  } catch (error) {
    console.error('Failed to create review:', error)
    return { success: false, error: 'Failed to create review' }
  }
}

export async function updateReviewStatus({
  reviewId,
  status,
  decision,
  comments,
}: {
  reviewId: string
  status: ReviewStatus
  decision?: ReviewDecision
  comments?: string
}) {
  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        decision,
        comments,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Notify creator if review is completed
    if (status === 'COMPLETED' && decision) {
      const entityTitle = review.testCase?.title || review.testSuite?.title || 'Unknown'
      const entityType = review.testCaseId ? 'test_case' : 'test_suite'
      const entityId = review.testCaseId || review.testSuiteId || undefined

      const decisionText = decision === 'APPROVED' ? 'approved' : decision === 'REJECTED' ? 'rejected' : 'requested changes to'

      await createNotification({
        userId: review.creator.id,
        type: 'REVIEW_COMPLETED',
        title: 'Review completed',
        message: `${review.assignee.name || review.assignee.email} ${decisionText} "${entityTitle}"`,
        entityType,
        entityId,
      })

      // Log activity
      if (entityId) {
        await logActivity({
          userId: review.assignedTo,
          action: `reviewed_${decision.toLowerCase()}`,
          entityType,
          entityId,
          entityTitle,
        })
      }
    }

    return { success: true, review }
  } catch (error) {
    console.error('Failed to update review status:', error)
    return { success: false, error: 'Failed to update review status' }
  }
}

export async function getReviews({
  testCaseId,
  testSuiteId,
  assignedTo,
  createdBy,
  status,
}: {
  testCaseId?: string
  testSuiteId?: string
  assignedTo?: string
  createdBy?: string
  status?: ReviewStatus
}) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        testCaseId,
        testSuiteId,
        assignedTo,
        createdBy,
        status,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, reviews }
  } catch (error) {
    console.error('Failed to get reviews:', error)
    return { success: false, error: 'Failed to get reviews' }
  }
}

export async function getPendingReviews({ userId }: { userId: string }) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        assignedTo: userId,
        status: {
          in: ['PENDING', 'IN_REVIEW'],
        },
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, reviews }
  } catch (error) {
    console.error('Failed to get pending reviews:', error)
    return { success: false, error: 'Failed to get pending reviews' }
  }
}
