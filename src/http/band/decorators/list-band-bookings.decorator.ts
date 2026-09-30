import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListBandBookingsResponseDto } from '@shared/communication/dtos/band/list-band-bookings-response.dto';

export function ApiListBandBookings() {
  return applyDecorators(
    ApiOperation({ summary: 'List bookings of the band with their contact' }),
    ApiResponse({
      status: 200,
      description: 'Bookings retrieved successfully',
      type: ListBandBookingsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    ApiResponse({
      status: 422,
      description: 'Unprocessable Entity — invalid band id',
    }),
    HttpCode(HttpStatus.OK),
  );
}
