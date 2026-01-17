import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor (config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL')

    // 1. Initialize PostgreSQL pool with modern PG driver
    const pool = new Pool({
      connectionString,
      ssl: false, // Set to true if using a cloud DB like Supabase or Neon in production
    })

    // 2. Initialize Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool)

    // 3. Pass the adapter to the PrismaClient constructor
    super({ adapter })
  }

  /**
   * Automatically connect to the database when the module starts
   */
  async onModuleInit () {
    try {
      await this.$connect()
      this.logger.log('✅ Database connection established successfully')
    } catch (error) {
      this.logger.error(
        '❌ Failed to connect to the database. Application exiting...',
        error,
      )
      process.exit(1) // Stop the server if DB is unreachable
    }
  }

  /**
   * Ensure the database connection is closed gracefully when the app shuts down
   */
  async onModuleDestroy () {
    try {
      await this.$disconnect()
      this.logger.warn('🔌 Database disconnected safely')
    } catch (error) {
      this.logger.error('⚠️ Error during database disconnection', error)
    }
  }

  /**
   * Utility to clean the database (Useful for testing phases)
   */
  async cleanDb () {
    if (process.env.NODE_ENV === 'production') return
    return this.$transaction([
      this.message.deleteMany(),
      this.participant.deleteMany(),
      this.conversation.deleteMany(),
      this.user.deleteMany(),
    ])
  }
}
