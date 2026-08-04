import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddSongToSetlistParamDto {
  @ApiProperty({
    description: 'UUID da banda',
    example: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  @IsUUID(7, {
    message:
      'id must be a valid UUID v7, Ex: 019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID do setlist',
    example: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  @IsUUID(7, {
    message:
      'setlistId must be a valid UUID v7, Ex: 019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  setlistId: string;
}
