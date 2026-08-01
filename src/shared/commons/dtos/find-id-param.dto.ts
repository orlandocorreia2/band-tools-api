import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindIdParamDto {
  @ApiProperty({
    description: 'UUID',
    example: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  @IsUUID(7, {
    message:
      'id must be a valid UUID v7, Ex: 019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  id: string;
}
