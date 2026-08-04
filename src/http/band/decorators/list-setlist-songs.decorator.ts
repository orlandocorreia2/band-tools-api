import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListSetlistSongsResponseDto } from '@shared/communication/dtos/band/list-setlist-songs-response.dto';

export function ApiListSetlistSongs() {
  return applyDecorators(
    ApiOperation({ summary: 'List songs of a band setlist' }),
    ApiResponse({
      status: 200,
      description: 'Setlist songs retrieved successfully',
      type: ListSetlistSongsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    HttpCode(HttpStatus.OK),
  );
}
