import { FileValidator } from '@nestjs/common'

export class FileTypeValidator extends FileValidator {
  constructor () {
    super({})
  }

  isValid (file: Express.Multer.File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    return allowedTypes.includes(file.mimetype)
  }

  buildErrorMessage (): string {
    return 'Invalid file type. Only .png, .jpg and .jpeg are allowed.'
  }
}
