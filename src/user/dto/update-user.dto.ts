import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  displayname?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string
}
