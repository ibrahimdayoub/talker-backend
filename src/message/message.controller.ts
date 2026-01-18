import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { GetUser } from '../utils/get-user.decorator'
import { JwtStrategy } from '../security/jwt.strategy'
import { MessageService } from './message.service'

@ApiBearerAuth()
@UseGuards(JwtStrategy)
@Controller('messages')
export class MessageController {
  constructor (private readonly messageService: MessageService) {}

  /**
   * 1. Retrieve messages for a specific conversation (with pagination support)
   */
  @Get(':conversationId')
  async getMessages (
    @Param('conversationId') conversationId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.messageService.getMessagesByConversation(
      Number(conversationId),
      Number(limit),
      Number(page),
    )
  }

  /**
   * 2. Edit an existing message text
   */
  @Patch(':id')
  async editMessage (
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body('text') text: string,
  ) {
    return this.messageService.editMessage(id, userId, text)
  }

  /**
   * 3. Delete a message (Soft delete a message - WhatsApp style)
   */
  @Delete(':id')
  async deleteMessage (
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.messageService.deleteMessage(id, userId)
  }

  /**
   * 4. Mark all messages in a conversation as read by the user
   */
  @Patch(':conversationId/read')
  async markRead (
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @GetUser('id') userId: number,
  ) {
    return this.messageService.markAsRead(conversationId, userId)
  }
}
