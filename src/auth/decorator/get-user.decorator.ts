import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract user data from the request object.
 * This is populated by the JwtStrategy after successful authentication.
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Switch the context to HTTP and grab the request object
    const request = ctx.switchToHttp().getRequest();
    
    // If a specific field is requested (e.g., @GetUser('id')), return only that field
    if (data) {
      return request.user[data];
    }
    
    // Otherwise, return the full user object
    return request.user;
  },
);