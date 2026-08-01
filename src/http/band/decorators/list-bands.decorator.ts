import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListBandsResponseDto } from '@shared/communication/dtos/band/list-bands-response.dto';

export function ApiListBands() {
  return applyDecorators(
    ApiOperation({ summary: 'List bands the authenticated user belongs to' }),
    ApiResponse({
      status: 200,
      description: 'Bands retrieved successfully',
      type: ListBandsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    HttpCode(HttpStatus.OK),
  );
}
