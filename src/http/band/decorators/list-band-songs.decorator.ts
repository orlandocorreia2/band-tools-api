import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListBandSongsResponseDto } from '@shared/communication/dtos/band/list-band-songs-response.dto';

export function ApiListBandSongs() {
  return applyDecorators(
    ApiOperation({ summary: 'List songs in the band repertoire' }),
    ApiResponse({
      status: 200,
      description: 'Songs retrieved successfully',
      type: ListBandSongsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    HttpCode(HttpStatus.OK),
  );
}
