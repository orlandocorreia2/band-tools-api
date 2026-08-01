import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandStatusEnum } from '@shared/commons/enums/band.enum';

export class BandResponseDto {
  @ApiProperty({ example: '0192b1e0-6c3f-7c3a-9b1a-2f6d8e6d1a2b' })
  readonly id: string;

  @ApiProperty({ example: 'The Beatles' })
  readonly name: string;

  @ApiProperty({ example: 'Rock' })
  readonly genre: string;

  @ApiProperty({ example: 'England' })
  readonly state: string;

  @ApiProperty({ example: 'Liverpool' })
  readonly city: string;

  @ApiProperty({ example: 'Woolton' })
  readonly neighborhood: string;

  @ApiProperty({ example: '251 Menlove Avenue' })
  readonly address: string;

  @ApiProperty({ example: '1960-01-01' })
  readonly started_at: Date;

  @ApiProperty({ enum: BandStatusEnum, example: BandStatusEnum.Active })
  readonly status: BandStatusEnum;

  @ApiPropertyOptional({ example: 'Legendary rock band.' })
  readonly description?: string;

  @ApiPropertyOptional({ example: 'https://img.com/band.jpg' })
  readonly image?: string;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  private constructor(band: BandEntity) {
    this.id = band.id;
    this.name = band.name;
    this.genre = band.genre;
    this.state = band.state;
    this.city = band.city;
    this.neighborhood = band.neighborhood;
    this.address = band.address;
    this.started_at = band.started_at;
    this.status = band.status;
    this.description = band.description;
    this.image = band.image;
    this.created_at = band.created_at;
    this.updated_at = band.updated_at;
  }

  static fromEntity(band: BandEntity): BandResponseDto {
    return new BandResponseDto(band);
  }

  static fromEntities(bands: BandEntity[]): BandResponseDto[] {
    return bands.map((band) => BandResponseDto.fromEntity(band));
  }
}
