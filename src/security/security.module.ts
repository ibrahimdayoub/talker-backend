import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { RtStrategy } from './rt.strategy'

@Global()
@Module({
  imports: [
    PassportModule,
    /**
     * Using registerAsync to ensure the JWT_SECRET is loaded from ConfigService
     * This prevents issues with undefined environment variables during startup.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Default token
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRY') as any, // Default expiry
        },
      }),
    }),
  ],
  providers: [JwtStrategy, RtStrategy],
  exports: [JwtModule], // Exporting JwtModule to make it available Project-wide
})
export class SecurityModule {}
