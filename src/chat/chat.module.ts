import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../user/user.module'
import { ConversationModule } from '../conversation/conversation.module'
import { MessageModule } from '../message/message.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'

@Module({
  imports: [MessageModule, ConversationModule, UserModule, AuthModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
