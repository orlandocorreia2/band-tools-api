import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddSongToSetlistDto {
  @ApiProperty({
    description: 'UUID da música em band_songs',
    example: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  @IsUUID(7, {
    message:
      'bandSongId must be a valid UUID v7, Ex: 019a2635-cc34-745e-8d67-f0247e2dcba6',
  })
  bandSongId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  position: number;
}
