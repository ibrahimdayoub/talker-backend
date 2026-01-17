import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDto, UpdatePasswordDto } from './dto/index'

@Injectable()
export class UserService {
  constructor (private prisma: PrismaService) {}

  /**
   * 1. Get User Profile (Handles both "me" and specific user IDs with conditional privacy logic)
   */
  async getUser (currentUserId: number, identifier: string) {
    const targetId = identifier === 'me' ? currentUserId : Number(identifier)

    if (isNaN(targetId)) {
      throw new BadRequestException('Invalid user ID format')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    })

    if (!user) throw new NotFoundException('User not found')

    const isMe = user.id === currentUserId

    // Hide email from public view, only show if it's the current user's own profile
    const { email, ...publicData } = user

    return {
      data: {
        ...(isMe ? user : publicData),
        isMe,
      },
      message: 'Profile fetched successfully',
    }
  }

  /**
   * 2. Search Users (Find users by username or email while excluding the current user)
   */
  async searchUsers (query: string, currentUserId: number) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        isOnline: true,
      },
      take: 10,
    })
  }

  /**
   * 3. Update Basic Profile Data
   */
  async updateUser (userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    })

    const { password, ...userData } = user
    return {
      data: userData,
      message: 'Profile updated successfully',
    }
  }

  /**
   * 4. Update Profile Avatar
   */
  async updateAvatar (userId: number, avatarPath: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    })

    const { password, ...userData } = user
    return {
      data: userData,
      message: 'Avatar updated successfully',
    }
  }

  /**
   * 5. Secure Password Update
   */
  async updatePassword (userId: number, dto: UpdatePasswordDto) {
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the old one',
      )
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password)
    if (!isMatch)
      throw new UnauthorizedException('Current password is incorrect')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt)

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Password updated successfully' }
  }

  /**
   * 6. Update Online/Offline Status (Triggered by Socket Gateway)
   */
  async updateStatus (userId: string, status: boolean) {
    return await this.prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isOnline: status,
        lastSeen: new Date(),
      },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeen: true,
      },
    })
  }

  /**
   * 7. Delete Profile (Account)
   */
  async deleteUser (userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    await this.prisma.user.delete({ where: { id: userId } })
    return { message: 'Account deleted successfully' }
  }
}
