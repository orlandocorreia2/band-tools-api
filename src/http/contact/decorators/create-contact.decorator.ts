import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateContact() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new contact for the authenticated user',
    }),
    ApiResponse({ status: 201, description: 'Contact created successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 422,
      description: 'Unprocessable Entity — validation failed',
    }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
    HttpCode(HttpStatus.CREATED),
  );
}
