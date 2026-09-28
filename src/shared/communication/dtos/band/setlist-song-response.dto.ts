import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

export type SetlistSongPair = {
  bandSetlistSong: BandSetlistSongEntity;
  bandSong: BandSongEntity;
};

export class SetlistSongResponseDto {
  @ApiProperty({ example: 'a3f1c2e4-1234-7000-8000-abcdef123456' })
  readonly id: string;

  @ApiProperty({ example: 'a3f1c2e4-1234-7000-8000-abcdef654321' })
  readonly band_setlist_id: string;

  @ApiProperty({ example: 'a3f1c2e4-1234-7000-8000-fedcba123456' })
  readonly band_song_id: string;

  @ApiProperty({ example: 1 })
  readonly position: number;

  @ApiProperty({ example: 'Come As You Are' })
  readonly title: string;

  @ApiPropertyOptional({ example: 'Drop D', nullable: true })
  readonly tuning: string | null;

  @ApiPropertyOptional({ example: 'E Minor', nullable: true })
  readonly tonality: string | null;

  @ApiPropertyOptional({ example: 120, nullable: true })
  readonly bpm: number | null;

  @ApiPropertyOptional({ example: 219, nullable: true })
  readonly duration: number | null;

  @ApiPropertyOptional({ example: 'Letra da música...', nullable: true })
  readonly lyrics: string | null;

  @ApiPropertyOptional({
    example: 'Tocar mais devagar no refrão',
    nullable: true,
  })
  readonly notes: string | null;

  @ApiProperty({ example: '2026-08-03T12:00:00.000Z' })
  readonly created_at: Date;

  @ApiProperty({ example: '2026-08-03T12:00:00.000Z' })
  readonly updated_at: Date;

  private constructor(setlistSong: SetlistSongPair) {
    this.id = setlistSong.bandSetlistSong.id;
    this.band_setlist_id = setlistSong.bandSetlistSong.band_setlist_id;
    this.band_song_id = setlistSong.bandSetlistSong.band_song_id;
    this.position = setlistSong.bandSetlistSong.position;
    this.title = setlistSong.bandSong.title;
    this.tuning = setlistSong.bandSong.tuning ?? null;
    this.tonality = setlistSong.bandSong.tonality ?? null;
    this.bpm = setlistSong.bandSong.bpm ?? null;
    this.duration = setlistSong.bandSong.duration ?? null;
    this.lyrics = setlistSong.bandSong.lyrics ?? null;
    this.notes = setlistSong.bandSong.notes ?? null;
    this.created_at = setlistSong.bandSetlistSong.created_at;
    this.updated_at = setlistSong.bandSetlistSong.updated_at;
  }

  static fromEntity(setlistSong: SetlistSongPair): SetlistSongResponseDto {
    return new SetlistSongResponseDto(setlistSong);
  }

  static fromEntities(
    setlistSongs: SetlistSongPair[],
  ): SetlistSongResponseDto[] {
    return setlistSongs.map((setlistSong) =>
      SetlistSongResponseDto.fromEntity(setlistSong),
    );
  }
}
