import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import {
  SignupDto,
  SigninDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from './dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  /**
   * 1. Register a new user & Issue tokens
   */
  async signup (dto: SignupDto) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(dto.password, salt)

    // Prisma unique constraint will handle duplicate emails automatically via Global Filter
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
    })

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRtHash(user.id, tokens.refreshToken)

    const { password, hashedRt, ...userWithoutPassword } = user
    return { ...userWithoutPassword, ...tokens }
  }

  /**
   * 2. Log in & Update Refresh Token
   */
  async signin (dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) throw new UnauthorizedException('Invalid credentials')

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRtHash(user.id, tokens.refreshToken)

    return tokens
  }

  /**
   * 3. Validates the incoming RT and issues a new pair
   */
  async refreshTokens (userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied')

    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRt)
    if (!rtMatches) throw new ForbiddenException('dccess Denied')

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRtHash(user.id, tokens.refreshToken)

    return tokens
  }

  /**
   * 4. Handle forgotten password (Send verification code)
   */
  async forgotPassword (dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) throw new NotFoundException('User not found')

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 Minutes

    await this.prisma.passwordReset.create({
      data: {
        email: dto.email,
        code: code,
        expiresAt: expiresAt,
      },
    })

    await this.mailService.sendVerificationCode(dto.email, code)

    return { message: 'Verification code has been sent to your email' }
  }

  /**
   * 5. Reset password using the verification code
   */
  async resetPassword (dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match')
    }

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        email: dto.email,
        code: dto.verificationCode,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetRecord)
      throw new BadRequestException('Invalid or expired verification code')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt)

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    })

    // Cleanup: delete all reset records for this user
    await this.prisma.passwordReset.deleteMany({
      where: { email: dto.email },
    })

    return { message: 'Password has been reset successfully' }
  }

  /**
   * 6. Logout & Clear the hashed RT from DB
   */
  async logout (userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: { not: null },
      },
      data: {
        hashedRt: null,
        isOnline: false,
      },
    })
    return { message: 'Logged out successfully' }
  }

  // HELPERS --------------------------------------------------------------------------------------

  /**
   * 1. Verify JWT token (Used by Gateway/Guards)
   */
  async verifyToken (token: string) {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  /**
   * 2.  Update the hashed refresh token in database
   */
  async updateRtHash (userId: number, rt: string) {
    const hash = await bcrypt.hash(rt, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    })
  }

  /**
   * 3. Generate both access and refresh tokens
   */
  async getTokens (userId: number, email: string) {
    const payload = { sub: userId, email }

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRY') as any, // Short-lived
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: this.config.get<string>('RT_EXPIRY') as any, // Long-lived
      }),
    ])

    return {
      accessToken: at,
      refreshToken: rt,
    }
  }
}
