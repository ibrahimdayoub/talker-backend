import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Global filter to catch and format Prisma-specific errors.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      // CASE 1: Unique Constraint Violation (e.g., Email already exists)
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const target = exception.meta?.target;
        let fieldName = 'Field';

        if (Array.isArray(target)) {
          fieldName = target.join(', ');
        } else if (typeof target === 'string') {
          fieldName = target;
        } else {
          // Fallback regex to extract field from raw message
          const regex = /fields: \(`(.*)`\)/;
          const match = exception.message.match(regex);
          if (match && match[1]) fieldName = match[1];
        }

        const cleanFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        response.status(status).json({
          statusCode: status,
          message: `${cleanFieldName} already exists`,
          error: 'Conflict',
        });
        break;
      }

      // CASE 2: Record Not Found (e.g., update/delete non-existent ID)
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;

        const model = (exception.meta?.modelName as string) || 'Record';
        
        response.status(status).json({
          statusCode: status,
          message: `${model} not found`,
          error: 'Not Found',
        });
        break;
      }

      // DEFAULT: Handle other errors using the base class
      default:
        super.catch(exception, host);
        break;
    }
  }
}