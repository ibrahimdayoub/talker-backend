import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ConversationService {
  constructor (private prisma: PrismaService) {}

  /**
   * 1. Find or Create a Private (1-on-1) Conversation (ensures no duplicate private rooms exist for the same two users)
   */
  async findOrCreatePrivateConversation (user1Id: number, user2Id: number) {
    if (user1Id === user2Id) {
      throw new BadRequestException(
        'You cannot start a conversation with yourself',
      )
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: user1Id } } },
          { participants: { some: { userId: user2Id } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    })

    if (existing) return existing

    return this.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId: user1Id }, { userId: user2Id }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * 2. Create a Group Conversation
   */
  async createGroupConversation (
    name: string,
    adminId: number,
    participantIds: number[],
  ) {
    // Check if participantIds is empty or null
    if (!participantIds || participantIds.length === 0) {
      throw new BadRequestException(
        'A group must have at least one participant other than the admin',
      )
    }

    // Remove adminId from participantIds if it was sent by mistake
    const uniqueParticipants = participantIds.filter(id => id !== adminId)

    return this.prisma.conversation.create({
      data: {
        name,
        isGroup: true,
        participants: {
          create: [
            { userId: adminId, isAdmin: true },
            ...uniqueParticipants.map(id => ({ userId: id })),
          ],
        },
      },
    })
  }

  /**
   * 3. Get all conversations for a specific user (Sidebar list)
   */
  async getUserConversations (userId: number) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          where: { userId: { not: userId } },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /**
   * 4. Get detailed info about one conversation
   */
  async getConversationDetails (conversationId: number, userId: number) {
    await this.validateMembership(conversationId, userId)

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) throw new NotFoundException('Conversation not found')
    return conversation
  }

  /**
   * 5. Add Participant to a Group
   */
  async addParticipant (
    conversationId: number,
    targetUserId: number,
    adminId: number,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    })

    if (!conversation?.isGroup) {
      throw new BadRequestException('Cannot add participants to a private chat')
    }

    const requester = conversation.participants.find(p => p.userId === adminId)
    if (!requester?.isAdmin) {
      throw new ForbiddenException('Only admins can add members')
    }

    return this.prisma.participant.create({
      data: { conversationId, userId: targetUserId },
    })
  }

  /**
   * 6. Remove Participant or Leave Conversation
   */
  async removeParticipant (
    conversationId: number,
    targetUserId: number,
    requesterId: number,
  ) {
    // 1. Check if the requester is in the conversation and if they are an admin
    const requester = await this.prisma.participant.findUnique({
      where: { userId_conversationId: { userId: requesterId, conversationId } },
    })

    if (!requester) {
      throw new ForbiddenException('You are not a member of this conversation')
    }

    // 2. Check if the target user actually exists in this conversation
    const target = await this.prisma.participant.findUnique({
      where: {
        userId_conversationId: { userId: targetUserId, conversationId },
      },
    })

    if (!target) {
      throw new NotFoundException(
        'Target user is not a participant in this conversation',
      )
    }

    // Only an admin can remove others. Non-admins can only remove themselves (leave).
    const isLeaving = targetUserId === requesterId
    if (!requester.isAdmin && !isLeaving) {
      throw new ForbiddenException('Only admins can remove other members')
    }

    // If it's the last person leaving, we should probably trigger the delete logic, Or at least perform a normal delete
    return this.prisma.participant.delete({
      where: {
        userId_conversationId: { userId: targetUserId, conversationId },
      },
    })
  }

  /**
   * 7. Delete Conversation (Telegram style: hides for user, deletes if empty and admin rotation)
   */
  async deleteConversation (conversationId: number, userId: number) {
    return await this.prisma.$transaction(async tx => {
      // Check if the participant exists
      const participant = await tx.participant.findUnique({
        where: { userId_conversationId: { userId, conversationId } },
      })

      if (!participant) {
        throw new NotFoundException('Conversation not found or access denied')
      }

      // Remove the user
      await tx.participant.delete({
        where: { userId_conversationId: { userId, conversationId } },
      })

      // Check remaining participants
      const remainingParticipants = await tx.participant.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }, // Get the oldest member first
      })

      if (remainingParticipants.length === 0) {
        // Cleanup: No one left, delete everything
        await tx.message.deleteMany({ where: { conversationId } })
        await tx.conversation.delete({ where: { id: conversationId } })
        return { success: true, message: 'Conversation fully deleted' }
      }

      // Admin Rotation: If the leaving user was an admin, promote the next oldest member
      if (participant.isAdmin) {
        await tx.participant.update({
          where: { id: remainingParticipants[0].id },
          data: { isAdmin: true },
        })
      }

      return { success: true, message: 'You left the conversation' }
    })
  }

  // HELPERS --------------------------------------------------------------------------------------

  /**
   * Check if user is a member (Used by Gateway)
   */
  async isParticipant (
    conversationId: number,
    userId: number,
  ): Promise<boolean> {
    const participant = await this.prisma.participant.findUnique({
      where: { userId_conversationId: { userId, conversationId } },
    })
    return !!participant
  }

  /**
   * Private membership validator
   */
  private async validateMembership (conversationId: number, userId: number) {
    const isMember = await this.isParticipant(conversationId, userId)
    if (!isMember)
      throw new ForbiddenException('Access denied to this conversation')
  }
}
