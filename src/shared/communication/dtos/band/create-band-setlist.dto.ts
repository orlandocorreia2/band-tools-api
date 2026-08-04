import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBandSetlistDto {
  @ApiProperty({ example: 'Show de Sábado', minLength: 1 })
  @IsString()
  @MinLength(1)
  name: string;
}
