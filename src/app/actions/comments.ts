'use server'

import { prisma } from '@/lib/prisma'
import { createNotification } from './notifications'
import { logActivity } from './activity'

export async function createComment({
  content,
  userId,
  testCaseId,
  testSuiteId,
  defectId,
  parentId,
  mentions,
}: {
  content: string
  userId: string
  testCaseId?: string
  testSuiteId?: string
  defectId?: string
  parentId?: string
  mentions?: string[]
}) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        testCaseId,
        testSuiteId,
        defectId,
        parentId,
        mentions: mentions || [],
      },
      include: {
        user: {
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
        defect: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      const entityTitle = comment.testCase?.title || comment.testSuite?.title || comment.defect?.title || 'Unknown'
      const entityType = testCaseId ? 'test_case' : testSuiteId ? 'test_suite' : 'defect'
      const entityId = testCaseId || testSuiteId || defectId

      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== userId) {
          await createNotification({
            userId: mentionedUserId,
            type: 'MENTION',
            title: 'You were mentioned',
            message: `${comment.user.name || comment.user.email} mentioned you in a comment on "${entityTitle}"`,
            entityType,
            entityId,
          })
        }
      }
    }

    // Create notification for parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          testCase: { select: { title: true } },
          testSuite: { select: { title: true } },
          defect: { select: { title: true } },
        },
      })

      if (parentComment && parentComment.userId !== userId) {
        const entityTitle = parentComment.testCase?.title || parentComment.testSuite?.title || parentComment.defect?.title || 'Unknown'
        const entityType = testCaseId ? 'test_case' : testSuiteId ? 'test_suite' : 'defect'
        const entityId = testCaseId || testSuiteId || defectId

        await createNotification({
          userId: parentComment.userId,
          type: 'COMMENT_REPLY',
          title: 'New reply to your comment',
          message: `${comment.user.name || comment.user.email} replied to your comment on "${entityTitle}"`,
          entityType,
          entityId,
        })
      }
    }

    // Log activity
    const entityType = testCaseId ? 'test_case' : testSuiteId ? 'test_suite' : 'defect'
    const entityId = testCaseId || testSuiteId || defectId
    const entityTitle = comment.testCase?.title || comment.testSuite?.title || comment.defect?.title || 'Unknown'

    if (entityId) {
      await logActivity({
        userId,
        action: 'commented',
        entityType,
        entityId,
        entityTitle,
      })
    }

    return { success: true, comment }
  } catch (error) {
    console.error('Failed to create comment:', error)
    return { success: false, error: 'Failed to create comment' }
  }
}

export async function getComments({
  testCaseId,
  testSuiteId,
  defectId,
}: {
  testCaseId?: string
  testSuiteId?: string
  defectId?: string
}) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        testCaseId,
        testSuiteId,
        defectId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, comments }
  } catch (error) {
    console.error('Failed to get comments:', error)
    return { success: false, error: 'Failed to get comments' }
  }
}

export async function updateComment({
  commentId,
  content,
}: {
  commentId: string
  content: string
}) {
  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, comment }
  } catch (error) {
    console.error('Failed to update comment:', error)
    return { success: false, error: 'Failed to update comment' }
  }
}

export async function deleteComment({ commentId }: { commentId: string }) {
  try {
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}
