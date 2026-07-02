import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBandDto {
  @ApiProperty({ example: 'Nome da Banda', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Heavy Metal' })
  @IsString()
  @MinLength(1)
  genre: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(1)
  state: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MinLength(1)
  neighborhood: string;

  @ApiProperty({ example: 'Avenida Paulista, 1000' })
  @IsString()
  @MinLength(1)
  address: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDate()
  @Type(() => Date)
  started_at: Date;

  @ApiPropertyOptional({ example: 'Descrição da banda.' })
  @IsOptional()
  @IsString()
  description?: string;
}
