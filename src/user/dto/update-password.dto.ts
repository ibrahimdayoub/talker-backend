import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator'

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'newPassword is too weak. Must include uppercase, lowercase, and numbers',
  })
  newPassword: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'confirmPassword is too weak. Must include uppercase, lowercase, and numbers',
  })
  confirmPassword: string
}
