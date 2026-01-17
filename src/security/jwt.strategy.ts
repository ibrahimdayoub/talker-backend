import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor (config: ConfigService, private prisma: PrismaService) {
    const jwtSecret = config.get<string>('JWT_SECRET')

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    super({
      // 1. Extract Bearer token from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Secret key used to sign the token (ensure it matches your .env)
      secretOrKey: process.env.JWT_SECRET!,
      // 3. Reject the token if it has expired
      ignoreExpiration: false,
    })
  }

  /**
   * The validate method runs automatically after the JWT is decrypted.
   * Whatever this method returns is attached to the "Request" object as "user".
   */
  async validate (payload: { sub: number; email: string }) {
    // Optimization: Select only necessary fields to avoid heavy DB queries
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException(
        'Session invalid or user no longer exists',
      )
    }

    // This return value becomes "req.user"
    return user
  }
}

// GoogleStrategy Class
// FacebookStrategy Class
