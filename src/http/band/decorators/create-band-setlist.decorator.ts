import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateBandSetlist() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new setlist for the band' }),
    ApiResponse({ status: 201, description: 'Setlist created successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    ApiResponse({
      status: 422,
      description: 'Unprocessable Entity — validation failed',
    }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
    HttpCode(HttpStatus.CREATED),
  );
}
