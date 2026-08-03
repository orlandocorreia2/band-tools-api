import { ApiProperty } from '@nestjs/swagger';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';

export class BandSetlistResponseDto {
  @ApiProperty({ example: 'a3f1c2e4-1234-7000-8000-abcdef123456' })
  readonly id: string;

  @ApiProperty({ example: 'a3f1c2e4-1234-7000-8000-abcdef654321' })
  readonly band_id: string;

  @ApiProperty({ example: 'Show de Sábado' })
  readonly name: string;

  @ApiProperty({ example: '2026-08-03T12:00:00.000Z' })
  readonly created_at: Date;

  @ApiProperty({ example: '2026-08-03T12:00:00.000Z' })
  readonly updated_at: Date;

  private constructor(bandSetlist: BandSetlistEntity) {
    this.id = bandSetlist.id;
    this.band_id = bandSetlist.band_id;
    this.name = bandSetlist.name;
    this.created_at = bandSetlist.created_at;
    this.updated_at = bandSetlist.updated_at;
  }

  static fromEntity(bandSetlist: BandSetlistEntity): BandSetlistResponseDto {
    return new BandSetlistResponseDto(bandSetlist);
  }

  static fromEntities(
    bandSetlists: BandSetlistEntity[],
  ): BandSetlistResponseDto[] {
    return bandSetlists.map((bandSetlist) =>
      BandSetlistResponseDto.fromEntity(bandSetlist),
    );
  }
}
