import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';

export class BandSongResponseDto {
  @ApiProperty({ example: '0192b1e0-6c3f-7c3a-9b1a-2f6d8e6d1a2b' })
  readonly id: string;

  @ApiProperty({ example: '0192b1e0-6c3f-7c3a-9b1a-2f6d8e6d1a2b' })
  readonly band_id: string;

  @ApiProperty({ example: 'Come As You Are' })
  readonly title: string;

  @ApiPropertyOptional({ example: 'Drop D' })
  readonly tuning?: string;

  @ApiPropertyOptional({ example: 'E Minor' })
  readonly tonality?: string;

  @ApiPropertyOptional({ example: 120 })
  readonly bpm?: number;

  @ApiPropertyOptional({ example: 219 })
  readonly duration?: number;

  @ApiPropertyOptional({ example: 'Letra da música...' })
  readonly lyrics?: string;

  @ApiPropertyOptional({ example: 'Tocar mais devagar no refrão' })
  readonly notes?: string;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  private constructor(bandSong: BandSongEntity) {
    this.id = bandSong.id;
    this.band_id = bandSong.band_id;
    this.title = bandSong.title;
    this.tuning = bandSong.tuning;
    this.tonality = bandSong.tonality;
    this.bpm = bandSong.bpm;
    this.duration = bandSong.duration;
    this.lyrics = bandSong.lyrics;
    this.notes = bandSong.notes;
    this.created_at = bandSong.created_at;
    this.updated_at = bandSong.updated_at;
  }

  static fromEntity(bandSong: BandSongEntity): BandSongResponseDto {
    return new BandSongResponseDto(bandSong);
  }

  static fromEntities(bandSongs: BandSongEntity[]): BandSongResponseDto[] {
    return bandSongs.map((bandSong) =>
      BandSongResponseDto.fromEntity(bandSong),
    );
  }
}
