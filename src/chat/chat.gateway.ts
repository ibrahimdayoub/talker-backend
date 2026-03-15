import { Logger } from '@nestjs/common'
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import { UserService } from '../user/user.service'
import { ConversationService } from '../conversation/conversation.service'
import { MessageService } from '../message/message.service'

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name)

  @WebSocketServer()
  server: Server

  constructor (
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection (client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token

      if (!token) {
        this.logger.error('Connection rejected: No token provided.')
        return client.disconnect()
      }

      const payload = await this.authService.verifyToken(token as string)
      const userId = payload.sub

      // Persist userId in socket session
      client.data.userId = userId

      // Join a private room for personal notifications (e.g., "user_notifications_5")
      await client.join(`user_notifications_${userId}`)

      // Join a private room for direct messages (e.g., "user_5")
      await client.join(`user_${userId}`)

      // Update user status to ONLINE in database
      const updatedUser = await this.userService.updateStatus(
        userId.toString(),
        true,
      )

      // Notify all users that this user is now online
      this.server.emit('userStatus', updatedUser)
      this.logger.log(`Authenticated: ${updatedUser.username} (ID: ${userId})`)
    } catch (error) {
      this.logger.error('Connection rejected: Handshake authentication failed.')
      client.disconnect()
    }
  }

  async handleDisconnect (client: Socket) {
    const userId = client.data.userId

    if (userId) {
      const updatedUser = await this.userService.updateStatus(
        userId.toString(),
        false,
      )
      this.server.emit('userStatus', updatedUser)
      this.logger.warn(`Disconnected: ${updatedUser.username}`)
    }
  }

  @SubscribeMessage('createConversation')
  async handleCreateConversation (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversation: any; receiverId: number },
  ) {
    const userId = client.data.userId

    this.logger.log(
      `💬 Creating conversation ${payload.conversation.id} (between [${userId},${payload.receiverId}])`,
    )

    const roomName = `conversation_${payload.conversation.id}`
    await client.join(roomName)

    this.logger.log(
      `✅ User ${userId} joined room ${roomName} (new conversation)`,
    )

    // Send the new conversation to the receiver
    this.server
      .to(`user_notifications_${payload.receiverId}`)
      .emit('newConversation', payload.conversation)

    return { success: true }
  }

  @SubscribeMessage('createGroup')
  async handleCreateGroup (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { name: string; participants: number[] },
  ) {
    const adminId = client.data.userId

    const allParticipants = [...new Set([adminId, ...payload.participants])]

    const group = await this.conversationService.createGroupConversation(
      payload.name,
      adminId,
      allParticipants,
    )

    this.logger.log(
      `💬 Creating group ${group.id} (between [${allParticipants.toString()}])`,
    )

    console.log('✅ Group created:', group.id)

    const roomName = `conversation_${group.id}`
    await client.join(roomName)

    this.logger.log(`✅ Creator ${adminId} joined room ${roomName} (new group)`)

    // Send the new conversation to the receivers except the sender
    allParticipants.forEach(participantId => {
      if (participantId !== adminId) {
        this.server
          .to(`user_notifications_${participantId}`)
          .emit('newGroup', group)
      }
    })

    return group
  }

  @SubscribeMessage('joinConversation')
  async handleJoinRoom (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.userId

    this.logger.log(
      `💬 User ${userId} joining conversation ${payload.conversationId}`,
    )

    const isMember = await this.conversationService.isParticipant(
      payload.conversationId,
      userId,
    )
    if (!isMember) return { error: 'Unauthorized: Access denied to this room' }

    const roomName = `conversation_${payload.conversationId}`
    await client.join(roomName)

    this.logger.log(`✅ User ${userId} joined room ${roomName}`)

    const messages = await this.messageService.getMessagesByConversation(
      payload.conversationId,
    )

    return messages.map(msg => ({
      ...msg,
      user: {
        id: msg.userId,
        username: msg.user.username,
        avatar: msg.user.avatar,
      },
    }))
  }

  @SubscribeMessage('sendMessage')
  async handleMessage (
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: number; text: string; receiverId?: number },
  ) {
    const senderId = client.data.userId

    console.log('📨 Sending message:', payload)

    // Security: Verify if sender belongs to the conversation
    const isMember = await this.conversationService.isParticipant(
      payload.conversationId,
      senderId,
    )
    if (!isMember)
      return {
        error: 'Unauthorized: You are not a member of this conversation',
      }

    // Save message to database
    const savedMessage = await this.messageService.createMessage(
      senderId,
      payload.conversationId,
      payload.text,
    )

    // Broadcast message to everyone in the conversation room
    const roomName = `conversation_${payload.conversationId}`
    console.log(`📢 Broadcasting to room: ${roomName}`)
    this.server.to(roomName).emit('receiveMessage', savedMessage)
    // client.broadcast.to(roomName).emit('receiveMessage', savedMessage)

    // Send real-time notification to the receiver if provided
    if (payload.receiverId) {
      console.log(`🔔 Sending notification to user_${payload.receiverId}`)
      this.server
        .to(`user_notifications_${payload.receiverId}`)
        .emit('newNotification', {
          from: savedMessage.user.username,
          text: payload.text,
          conversationId: payload.conversationId,
        })
    }

    return savedMessage
  }

  @SubscribeMessage('messagesRead')
  async handleMessagesRead (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.userId

    await this.messageService.markAsRead(payload.conversationId, userId)

    const roomName = `conversation_${payload.conversationId}`
    client.broadcast.to(roomName).emit('messagesMarkedAsRead', {
      conversationId: payload.conversationId,
      readBy: userId,
      readAt: new Date(),
    })
  }

  @SubscribeMessage('typing')
  handleTyping (
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: number; userName: string; isTyping: boolean },
  ) {
    const roomName = `conversation_${payload.conversationId}`
    client.broadcast.to(roomName).emit('userTyping', {
      conversationId: payload.conversationId,
      userName: payload.userName,
      isTyping: payload.isTyping,
    })
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage (
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { messageId: number; conversationId: number; text: string },
  ) {
    const userId = client.data.userId
    const updatedMessage = await this.messageService.editMessage(
      payload.messageId,
      userId,
      payload.text,
    )

    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('updateMessage', {
        messageId: payload.messageId,
        newText: payload.text,
        conversationId: payload.conversationId,
      })

    return updatedMessage
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: number; conversationId: number },
  ) {
    const userId = client.data.userId

    // Perform soft/hard delete in database
    await this.messageService.deleteMessage(payload.messageId, userId)

    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('deleteMessage', {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
      })

    return { success: true }
  }
}
