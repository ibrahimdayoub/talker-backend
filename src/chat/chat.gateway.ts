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

  // LIFECYCLE ------------------------------------------------------------------------------------

  /**
   * Handles user authentication and online status when a client connects.
   */
  async handleConnection (client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token

      if (!token) {
        this.logger.error('Connection rejected: No token provided.')
        return client.disconnect()
      }

      const payload = await this.authService.verifyToken(token as string)
      const userId = payload.id

      // Persist userId in socket session
      client.data.userId = userId

      // Join a private room for personal notifications (e.g., "user_notifications_5")
      await client.join(`user_notifications_${userId}`)

      // Update user status to ONLINE in database
      const updatedUser = await this.userService.updateStatus(
        userId.toString(),
        true,
      )

      // Notify all users that this user is now online
      this.server.emit('userStatusChanged', updatedUser)

      this.logger.log(`Authenticated: ${updatedUser.username} (ID: ${userId})`)
    } catch (error) {
      this.logger.error('Connection rejected: Handshake authentication failed.')
      client.disconnect()
    }
  }

  /**
   * Updates user status to offline when they disconnect.
   */
  async handleDisconnect (client: Socket) {
    const userId = client.data.userId

    if (userId) {
      const updatedUser = await this.userService.updateStatus(
        userId.toString(),
        false,
      )
      this.server.emit('userStatusChanged', updatedUser)
      this.logger.warn(`Disconnected: ${updatedUser.username}`)
    }
  }

  // MESSAGING ------------------------------------------------------------------------------------

  /**
   * Handles sending, persisting, and broadcasting messages.
   */
  @SubscribeMessage('sendMessage')
  async handleMessage (
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: number; text: string; receiverId?: number },
  ) {
    const senderId = client.data.userId

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
    this.server.to(roomName).emit('receiveMessage', savedMessage)

    // Send real-time notification to the receiver if provided
    if (payload.receiverId) {
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

  // ACTIONS --------------------------------------------------------------------------------------

  /**
   * Join Room: Allows a user to join a specific conversation room after validation.
   */
  @SubscribeMessage('joinConversation')
  async handleJoinRoom (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.userId

    const isMember = await this.conversationService.isParticipant(
      payload.conversationId,
      userId,
    )
    if (!isMember) return { error: 'Unauthorized: Access denied to this room' }

    client.join(`conversation_${payload.conversationId}`)

    // Return chat history for the joined room
    return this.messageService.getMessagesByConversation(payload.conversationId)
  }

  /**
   * Read Receipts: Notifies others when messages in a conversation have been read.
   */
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

  /**
   * Typing Indicator: Broadcasts typing status to other participants in the room.
   */
  @SubscribeMessage('typing')
  handleTyping (
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: number; userName: string; isTyping: boolean },
  ) {
    const roomName = `conversation_${payload.conversationId}`
    client.broadcast.to(roomName).emit('userTyping', {
      userName: payload.userName,
      isTyping: payload.isTyping,
    })
  }

  // MESSAGE MANAGEMENT ---------------------------------------------------------------------------

  /**
   * Edit: Handles real-time updates for message modifications.
   */
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
      .emit('messageUpdated', {
        messageId: payload.messageId,
        newText: payload.text,
      })

    return updatedMessage
  }

  /**
   * Delete: Handles real-time removal of messages and notifies all participants.
   */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage (
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: number; conversationId: number },
  ) {
    const userId = client.data.userId

    // Perform soft/hard delete in database
    await this.messageService.deleteMessage(payload.messageId, userId)

    // Notify all users in the conversation room to remove the message from their UI
    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('messageDeleted', {
        messageId: payload.messageId,
      })

    return { success: true }
  }
}
