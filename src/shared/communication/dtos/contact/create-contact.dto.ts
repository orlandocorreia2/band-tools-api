import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const BRAZILIAN_PHONE_REGEX = /^\d{10,11}$/;

export class CreateContactDto {
  @ApiProperty({ example: 'Maria Souza', minLength: 1 })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '11987654321' })
  @IsString()
  @Matches(BRAZILIAN_PHONE_REGEX, {
    message: 'phone must contain only digits (10 or 11 digits, no formatting)',
  })
  phone: string;

  @ApiPropertyOptional({ example: '1133654321' })
  @IsOptional()
  @IsString()
  @Matches(BRAZILIAN_PHONE_REGEX, {
    message:
      'alternate_phone must contain only digits (10 or 11 digits, no formatting)',
  })
  alternate_phone?: string;

  @ApiProperty({ example: 'Bar do Zé', minLength: 1 })
  @IsString()
  @MinLength(1)
  venue_name: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP', minLength: 1 })
  @IsString()
  @MinLength(1)
  address: string;

  @ApiProperty({ example: 'contato@bardoze.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Produtor', minLength: 1 })
  @IsString()
  @MinLength(1)
  role: string;

  @ApiPropertyOptional({ example: 'Prefere contato via WhatsApp' })
  @IsOptional()
  @IsString()
  notes?: string;
}
