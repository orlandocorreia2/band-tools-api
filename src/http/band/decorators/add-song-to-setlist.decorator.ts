import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiAddSongToSetlist() {
  return applyDecorators(
    ApiOperation({ summary: 'Add a repertoire song to a band setlist' }),
    ApiResponse({
      status: 201,
      description: 'Song added to the setlist successfully',
    }),
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
