import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Delete,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth } from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { FileTypeValidator } from '../utils/file-type-validator'
import { GetUser } from '../utils/get-user.decorator'
import { JwtGuard } from '../security/jwt.guard'
import { UserService } from './user.service'
import { UpdateUserDto, UpdatePasswordDto } from './dto/index'

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor (private readonly userService: UserService) {}

  /**
   * 1. Get User Profile (Handles both "me" and specific user IDs with conditional privacy logic)
   */
  @Get(':identifier')
  async getUser (
    @GetUser('id') currentUserId: number,
    @Param('identifier') identifier: string,
  ) {
    return this.userService.getUser(currentUserId, identifier)
  }

  /**
   * 2. Search Users (Find users by username or email while excluding the current user)
   */
  @Get('search')
  async search (
    @Query('q') query: string,
    @GetUser('id') currentUserId: number,
  ) {
    return this.userService.searchUsers(query, currentUserId)
  }

  /**
   * 3. Update Basic Profile Data
   */
  @Patch('update-profile')
  async updateUser (@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(userId, dto)
  }

  /**
   * 4. Update Profile Avatar
   */
  @Patch('update-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `avatar-${uniqueSuffix}${ext}`)
        },
      }),
    }),
  )
  async updateAvatar (
    @GetUser('id') userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator(),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB Limit
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const filePath = `/uploads/avatars/${file.filename}`
    return this.userService.updateAvatar(userId, filePath)
  }

  /**
   * 5. Secure Password Update
   */
  @Patch('update-password')
  async updatePassword (
    @GetUser('id') userId: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, dto)
  }

  /**
   * 6. Delete Profile (Account)
   */
  @Delete('delete-profile')
  async deleteUser (@GetUser('id') userId: number) {
    return this.userService.deleteUser(userId)
  }
}