import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Custom JWT Refresh Guard.
 * Marks a route to require a valid Refresh Token (RT).
 * Usage: @UseGuards(RtGuard)
 */
@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor () {
    super()
  }
}
