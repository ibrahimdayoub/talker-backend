import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string
}
