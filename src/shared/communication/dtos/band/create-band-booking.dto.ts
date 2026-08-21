import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_FEE = 99999999.99;

export class CreateBandBookingDto {
  @ApiProperty({ example: 'Show Bar do Zé', minLength: 1 })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: '019a2635-cc34-745e-8d67-f0247e2dcba6' })
  @IsUUID()
  contact_id: string;

  @ApiProperty({ example: '2026-09-12' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'start_time must be in HH:mm format' })
  start_time: string;

  @ApiProperty({ example: '1 hora', minLength: 1 })
  @IsString()
  @MinLength(1)
  duration: string;

  @ApiProperty({ example: 800.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_FEE)
  fee: number;

  @ApiPropertyOptional({ example: 'Consumação mínima de R$ 50,00 por pessoa' })
  @IsOptional()
  @IsString()
  consumption?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/bardoze' })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({ example: 'Levar equipamento de som próprio' })
  @IsOptional()
  @IsString()
  note?: string;
}
