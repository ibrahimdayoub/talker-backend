import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { SecurityModule } from './security/security.module'
import { MailModule } from './mail/mail.module'
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    PrismaModule,
    SecurityModule,
    MailModule,
    UserModule,
    ChatModule,
    ConversationModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
