import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

/**
 * AuthModule handles the routing and business logic for authentication.
 * It uses SecurityModule (Global) for JWT operations, PrismaModule (Global) for DB access and MailModule (Global) for email delivery.
 */
@Module({
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
