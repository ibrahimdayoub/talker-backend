import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { GetUser } from '../utils/get-user.decorator'
import { JwtStrategy } from '../security/jwt.strategy'
import { ConversationService } from './conversation.service'

@ApiBearerAuth()
@UseGuards(JwtStrategy)
@Controller('conversations')
export class ConversationController {
  constructor (private readonly conversationService: ConversationService) {}

  /**
   * 1. Find or Create a Private (1-on-1) Conversation (ensures no duplicate private rooms exist for the same two users)
   */
  @Post('private')
  async createPrivateChat (
    @GetUser('id') currentUserId: number,
    @Body('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return this.conversationService.findOrCreatePrivateConversation(
      currentUserId,
      targetUserId,
    )
  }

  /**
   * 2. Create a Group Conversation
   */
  @Post('group')
  async createGroupChat (
    @GetUser('id') adminId: number,
    @Body() body: { name: string; participants: number[] },
  ) {
    return this.conversationService.createGroupConversation(
      body.name,
      adminId,
      body.participants,
    )
  }

  /**
   * 3. Get all conversations for a specific user (Sidebar list)
   */
  @Get()
  async getUserConversations (@GetUser('id') userId: number) {
    return this.conversationService.getUserConversations(userId)
  }

  /**
   * 4. Get detailed info about one conversation
   */
  @Get(':id')
  async getConversationDetails (
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.conversationService.getConversationDetails(id, userId)
  }

  /**
   * 5. Add Participant to a Group
   */
  @Post(':id/participants')
  async addParticipant (
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) targetUserId: number,
    @GetUser('id') adminId: number,
  ) {
    return this.conversationService.addParticipant(id, targetUserId, adminId)
  }

  /**
   * 6. Remove Participant or Leave Conversation
   */
  @Delete(':id/participants/:userId')
  async removeParticipant (
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @GetUser('id') adminId: number,
  ) {
    return this.conversationService.removeParticipant(id, targetUserId, adminId)
  }

  /**
   * 7. Delete Conversation (Telegram style: hides for user, deletes if empty and admin rotation)
   */
  @Delete(':id')
  async deleteConversation (
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.conversationService.deleteConversation(id, userId)
  }
}
