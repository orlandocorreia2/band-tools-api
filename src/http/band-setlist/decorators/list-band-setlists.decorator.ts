import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListBandSetlistsResponseDto } from '@shared/communication/dtos/band-setlist/list-band-setlists-response.dto';

export function ApiListBandSetlists() {
  return applyDecorators(
    ApiOperation({ summary: 'List setlists of the band' }),
    ApiResponse({
      status: 200,
      description: 'Setlists retrieved successfully',
      type: ListBandSetlistsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    HttpCode(HttpStatus.OK),
  );
}
