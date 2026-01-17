import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor (private mailerService: MailerService) {}

  async sendVerificationCode (email: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bero Talker - Your Verification Code',
        template: './verification',
        context: {
          code: code,
        },
      })
      return true
    } catch (error) {
      console.error('Mail Error:', error)
      throw new InternalServerErrorException(
        'Failed to send verification email',
      )
    }
  }
}
