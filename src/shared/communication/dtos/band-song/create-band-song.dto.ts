import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBandSongDto {
  @ApiProperty({ example: 'Come As You Are', minLength: 1 })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'Drop D' })
  @IsOptional()
  @IsString()
  tuning?: string;

  @ApiPropertyOptional({ example: 'E Minor' })
  @IsOptional()
  @IsString()
  tonality?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  bpm?: number;

  @ApiPropertyOptional({ example: 219 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @ApiPropertyOptional({ example: 'Letra da música...' })
  @IsOptional()
  @IsString()
  lyrics?: string;

  @ApiPropertyOptional({ example: 'Tocar mais devagar no refrão' })
  @IsOptional()
  @IsString()
  notes?: string;
}
