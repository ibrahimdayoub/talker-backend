import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'bero@example.com',
    description: 'The email address associated with the account',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'NewPass@123',
    description:
      'New password: Min 8 chars, must include Uppercase, Lowercase, and Numbers',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'newPassword is too weak. Must include uppercase, lowercase, and numbers',
  })
  newPassword: string

  @ApiProperty({
    example: 'NewPass@123',
    description: 'Must match the new password exactly',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'confirmPassword is too weak. Must include uppercase, lowercase, and numbers',
  })
  confirmPassword: string

  @ApiProperty({
    example: '123456',
    description: 'The 6-digit verification code received via email',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'verificationCode must be exactly 6 characters' })
  @Matches(/^\d+$/, { message: 'verificationCode must contain only numbers' })
  verificationCode: string
}
