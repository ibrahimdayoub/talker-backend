import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Custom JWT Access Guard.
 * Marks a route to require a valid Access Token (AT).
 * Usage: @UseGuards(JwtGuard)
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor () {
    super()
  }
}
