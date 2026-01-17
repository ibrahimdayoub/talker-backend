import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator'

export class SignupDto {
  @ApiProperty({
    example: 'berouser',
    description: 'The unique username of the user',
  })
  @IsNotEmpty()
  @IsString()
  username: string

  @ApiProperty({
    example: 'bero@example.com',
    description: 'A valid email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'Password123',
    description: 'Min 8 chars, must include uppercase, lowercase, and numbers',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password is too weak. Must include uppercase, lowercase, and numbers',
  })
  password: string
}
