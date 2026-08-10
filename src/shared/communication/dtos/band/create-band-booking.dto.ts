import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const BRAZILIAN_PHONE_REGEX = /^\d{10,11}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_FEE = 99999999.99;

export class CreateBandBookingDto {
  @ApiProperty({ example: 'Show Bar do Zé', minLength: 1 })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'Maria Souza', minLength: 1 })
  @IsString()
  @MinLength(1)
  focal_point_name: string;

  @ApiProperty({ example: '11987654321' })
  @IsString()
  @Matches(BRAZILIAN_PHONE_REGEX, {
    message: 'phone must contain only digits (10 or 11 digits, no formatting)',
  })
  phone: string;

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

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP', minLength: 1 })
  @IsString()
  @MinLength(1)
  address: string;

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
