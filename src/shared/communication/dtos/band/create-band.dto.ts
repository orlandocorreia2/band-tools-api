import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BandGenreEnum } from '@shared/commons/enums/band.enum';

export class CreateBandDto {
  @ApiProperty({ example: 'Electric Grave', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ enum: BandGenreEnum, example: BandGenreEnum.HeavyMetal })
  @IsEnum(BandGenreEnum)
  genre: BandGenreEnum;

  @ApiProperty({ example: 'Brazil' })
  @IsString()
  @MinLength(1)
  country: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(1)
  state: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiProperty({ example: 'Jardim Ibirapuera' })
  @IsString()
  @MinLength(1)
  neighborhood: string;

  @ApiProperty({ example: 'Rua Solar dos Quevedos, 06' })
  @IsString()
  @MinLength(1)
  address: string;

  @ApiProperty({ example: '2017-01-01' })
  @IsDate()
  @Type(() => Date)
  started_at: Date;

  @ApiPropertyOptional({ example: 'A legendary heavy metal band.' })
  @IsOptional()
  @IsString()
  description?: string;
}
