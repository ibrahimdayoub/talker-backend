import {
  Body,
  Controller,
  Post,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  // ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { JwtGuard } from '../security/jwt.guard'
import { RtGuard } from '../security/rt.guard'
import { GetUser } from './decorator/get-user.decorator'
import { AuthService } from './auth.service'
import {
  SignupDto,
  SigninDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  /**
   * 1. Register a new user & Issue tokens
   */
  @Post('signup')
  @ApiOperation({ summary: '(Register a new user & Issue tokens)' })
  @ApiCreatedResponse({
    description: 'User registered successfully and tokens issued.',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or email already exists.',
  })
  async signup (@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  /**
   * 2. Log in & Update Refresh Token
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Log in & Update Refresh Token)' })
  @ApiOkResponse({ description: 'User logged in successfully.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async signin (@Body() dto: SigninDto) {
    return this.authService.signin(dto)
  }

  /**
   * 3. Validates the incoming RT and issues a new pair
   */
  @UseGuards(RtGuard)
  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '(Validates the incoming RT and issues a new pair (AT, RT))',
    description: 'Exchange a valid Refresh Token for a new pair of Access and Refresh tokens. This process invalidates the old Refresh Token for security (Rotation).',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'New pair of tokens issued successfully.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token expired or invalid.' })
  async refreshTokens (
    @GetUser('id') userId: number,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken)
  }

  /**
   * 4. Handle forgotten password (Send verification code)
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Send password reset verification code)' })
  @ApiOkResponse({
    description: 'If email exists, a verification code has been sent.',
  })
  async forgotPassword (@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  /**
   * 5. Reset password using the verification code
   */
  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Reset password using verification code)' })
  @ApiOkResponse({ description: 'Password reset successfully.' })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code.',
  })
  async resetPassword (@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  /**
   * 6. Logout & Clear the hashed RT from DB
   */
  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Logout & Clear the hashed RT from DB)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logged out successfully.' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing Access Token.' })
  async logout (@GetUser('id') userId: number) {
    return this.authService.logout(userId)
  }
}
