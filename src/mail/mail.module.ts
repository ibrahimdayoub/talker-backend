import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path'
import { MailService } from './mail.service'

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: Number(config.get('MAIL_PORT')),
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Bero Talker" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src', 'mail', 'templates'),
          // adapter: new EjsAdapter(), // verification.ejs // <%= code %>
          adapter: new HandlebarsAdapter(), // verification.hbs // {{ code }}
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
