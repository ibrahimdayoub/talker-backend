import { Logger, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { join } from 'path'
import { PrismaExceptionFilter } from './prisma/filters/exception.filter'
import { AppModule } from './app.module'

async function bootstrap () {
  const logger = new Logger('Main')

  // Create the application with Express underlying platform
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Enable CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: '*', // In production, replace '*' with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  // Global Validation Pipe, Automatically validates incoming requests against DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away data that is not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra data is sent
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  )

  // Global Exception Filter for Prisma, Catches database-specific errors and converts them to HTTP responses
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter))

  // Serve Static Files (Avatars & Attachments)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // Global prefix for all routes
  app.setGlobalPrefix('api')

  // Swagger API description
  const config = new DocumentBuilder()
    .setTitle('Bero Talker API')
    .setDescription('The Bero Talker Chat Application API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  // Start the Server
  const port = process.env.PORT ?? 3001
  await app.listen(port)

  logger.log(`🚀 Bero Talker Server: http://localhost:${port}/api`)
  logger.log(`📝 Bero Talker Docs: http://localhost:${port}/api/docs`)
  logger.log(`📂 Static Assets: http://localhost:${port}/api/uploads/`)
}

bootstrap()

/**
 * ==============================================================================
 * 🚀 BERO TALKER - DEVELOPMENT REFERENCE GUIDE
 * ==============================================================================
 * * 1️⃣ HTTP STATUS CODES (NestJS HttpStatus Enum)
 * ------------------------------------------------------------------------------
 * SUCCESS:
 * - OK (200)          : Standard success response (GET, PATCH, PUT).
 * - CREATED (201)     : Resource successfully created (POST).
 * - NO_CONTENT (204)  : Success but no data returned (e.g., Delete).
 * * CLIENT ERRORS:
 * - BAD_REQUEST (400) : Validation failed or invalid input.
 * - UNAUTHORIZED (401): Missing or invalid authentication token.
 * - FORBIDDEN (403)   : Authenticated but lacks permissions for the resource.
 * - NOT_FOUND (404)   : Resource could not be located.
 * - CONFLICT (409)    : Resource already exists (e.g., Email taken).
 * * SERVER ERRORS:
 * - INTERNAL_SERVER_ERROR (500): Unhandled exception or server crash.
 * * EXAMPLE USAGE:
 * throw new NotFoundException('User not found'); // Shortcut
 * throw new HttpException('Message', HttpStatus.NOT_FOUND); // Explicit
 *
 * * ----------------------------------------------------------------------------
 * 2️⃣ GIT COMMIT STANDARDS (Conventional Commits)
 * ------------------------------------------------------------------------------
 * Format: <type>(<scope>): <description>
 * * TYPES:
 * - feat     : New feature implementation.
 * - fix      : Bug fix or error resolution.
 * - docs     : Documentation updates or code comments.
 * - style    : Code formatting (white-space, semi-colons) - No logic change.
 * - refactor : Code restructuring for better quality - No feature change.
 * - perf     : Performance optimization.
 * - test     : Adding or updating tests.
 * - chore    : Routine tasks (library updates, config changes).
 * - ci       : Continuous Integration / Deployment setup.
 * * EXAMPLE:
 * feat(chat): implement real-time message broadcasting
 * fix(auth): resolve token expiration edge case
 *
 * * ----------------------------------------------------------------------------
 * 3️⃣ GIT COMMANDS CHEATSHEET
 * ------------------------------------------------------------------------------
 * * 3️⃣.1️⃣ DAILY WORKFLOW (The "Standard" Routine)
 * ------------------------------------------------------------------------------
 * - git status             : Show modified files (The "What's happening?" command).
 * - git add .              : Stage all changes for the next commit.
 * - git commit -m "msg"    : Save your staged changes to history.
 * - git push origin main   : Upload your local commits to GitHub/GitLab.
 * - git pull origin main   : Download latest changes from the server.
 *
 * * 3️⃣.2️⃣ EXPLORING HISTORY (Viewing Previous Commits)
 * ------------------------------------------------------------------------------
 * - git log                : Show full history (Author, Date, Message, Hash).
 * - git log --oneline      : Show simplified history (One line per commit).
 * - git log -n 5           : Show only the last 5 commits.
 * - git show <hash>        : See exactly what changed in a specific commit.
 * (Example: git show a1b2c3d)
 *
 * * 3️⃣.3️⃣ UNDOING & FIXING (Safety Net)
 * ------------------------------------------------------------------------------
 * - git checkout .         : Discard all local changes (Back to last commit).
 * - git commit --amend     : Fix the LAST commit message (Before pushing).
 * - git reset --soft HEAD~1: Undo last commit but KEEP your code changes.
 * - git reset --hard HEAD~1: DELETE last commit and all its code (DANGEROUS!).
 *
 * * 3️⃣.4️⃣ BRANCHING (Feature Isolation)
 * ------------------------------------------------------------------------------
 * - git branch             : List all local branches.
 * - git checkout -b <name> : Create a new branch and switch to it.
 * - git merge <name>       : Merge a specific branch into your current one.
 * ==============================================================================
 */
