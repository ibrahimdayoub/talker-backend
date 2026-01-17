import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'bero@example.com',
    description: 'The email address where the recovery code will be sent',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string
}
