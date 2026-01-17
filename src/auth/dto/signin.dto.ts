import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class SigninDto {
  @ApiProperty({
    example: 'bero@example.com',
    description: 'The registered email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'Password123',
    description: 'The user password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string
}
