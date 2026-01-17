import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MessageService {
  constructor (private prisma: PrismaService) {}

  /**
   * 1. Create a new message and update conversation meta-data
   */
  async createMessage (userId: number, conversationId: number, content: string) {
    const message = await this.prisma.message.create({
      data: {
        userId,
        conversationId,
        content,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })

    // Update conversation timestamp and lastMessageId for quick reference
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        lastMessageId: message.id,
      },
    })

    return message
  }

  /**
   * 2. Retrieve messages for a specific conversation (with pagination support)
   */
  async getMessagesByConversation (
    conversationId: number,
    limit: number = 50,
    page: number = 1,
  ) {
    // Calculate how many messages to bypass based on the current page
    const skip = (page - 1) * limit

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      take: limit,
      skip: skip,
    })

    return messages.map(msg => {
      if (msg.isDeleted) {
        return {
          ...msg,
          content: 'This message was deleted',
        }
      }
      return msg
    })
  }

  /**
   * 3. Edit an existing message content
   */
  async editMessage (messageId: number, userId: number, newText: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) throw new NotFoundException('Message not found')
    if (message.userId !== userId)
      throw new ForbiddenException('You can only edit your own messages')

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: newText,
        updatedAt: new Date(), // Used to indicate the message was edited in UI
      },
    })
  }

  /**
   * 4. Delete a message (Soft delete a message - WhatsApp style)
   */
  async deleteMessage (messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) throw new NotFoundException('Message not found')

    // Security check: Only the sender can delete the message
    if (message.userId !== userId)
      throw new ForbiddenException('You can only delete your own messages')

    // Perform Soft Delete
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true, // Mark it as deleted
      },
    })
  }

  /**
   * 5. Mark all messages in a conversation as read by the user
   */
  async markAsRead (conversationId: number, userId: number) {
    return this.prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        userId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    })
  }
}
