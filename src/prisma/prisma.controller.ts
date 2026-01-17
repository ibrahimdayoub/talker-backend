import { Controller, Post } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Controller('dev')
export class DevController {
  constructor (private readonly prismaService: PrismaService) {}

  @Post('reset-database')
  async reset () {
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Action not allowed in production!' }
    }
    await this.prismaService.cleanDb()
    return { message: 'Database cleaned successfully' }
  }
}
