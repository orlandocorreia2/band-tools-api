import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListContactsResponseDto } from '@shared/communication/dtos/contact/list-contacts-response.dto';

export function ApiListContacts() {
  return applyDecorators(
    ApiOperation({ summary: 'List contacts of the authenticated user' }),
    ApiResponse({
      status: 200,
      description: 'Contacts retrieved successfully',
      type: ListContactsResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    HttpCode(HttpStatus.OK),
  );
}
