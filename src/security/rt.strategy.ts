import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { Injectable, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor (config: ConfigService) {
    const rtSecret = config.get<string>('RT_SECRET')

    if (!rtSecret) {
      throw new Error('RT_SECRET is not defined in environment variables')
    }

    super({
      // 1. Extract Refresh Token from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Use the dedicated RT_SECRET for refresh tokens
      secretOrKey: rtSecret,
      // 3. Keep the request object to extract the raw token in validate
      passReqToCallback: true,
    })
  }

  /**
   * The validate method for Refresh Token.
   * We extract the raw RT to compare it with the hashed version in the DB.
   */
  validate (req: Request, payload: { sub: number; email: string }) {
    // 1. Safely get the authorization header
    const authHeader = req.get('authorization')

    // 2. Ensure the header exists to avoid runtime errors
    if (!authHeader) {
      throw new ForbiddenException('Refresh token is missing')
    }

    // 3. Clean the token string (Remove Bearer prefix)
    const refreshToken = authHeader.replace('Bearer', '').trim()

    // 4. Final check: Ensure the token is not just an empty string
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token malformed')
    }

    // Return the payload + the raw token for the refresh logic in AuthService
    return {
      id: payload.sub,
      ...payload,
      refreshToken,
    };
  }
}
