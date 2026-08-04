import { BandSongResponseDto } from '@shared/communication/dtos/band/band-song-response.dto';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeBandSong = (): BandSongEntity =>
  new BandSongEntity({
    id: 'song-uuid',
    band_id: 'band-uuid',
    title: 'Come As You Are',
    tuning: 'Drop D',
    tonality: 'E Minor',
    bpm: 120,
    duration: 219,
    lyrics: 'Letra da música...',
    notes: 'Tocar mais devagar no refrão',
  });

describe('BandSongResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all fields from a BandSongEntity', () => {
      const bandSong = makeBandSong();

      const dto = BandSongResponseDto.fromEntity(bandSong);

      expect(dto).toEqual({
        id: bandSong.id,
        band_id: bandSong.band_id,
        title: bandSong.title,
        tuning: bandSong.tuning,
        tonality: bandSong.tonality,
        bpm: bandSong.bpm,
        duration: bandSong.duration,
        lyrics: bandSong.lyrics,
        notes: bandSong.notes,
        created_at: bandSong.created_at,
        updated_at: bandSong.updated_at,
      });
    });
  });

  describe('fromEntities', () => {
    it('should map a list of BandSongEntity to a list of BandSongResponseDto', () => {
      const bandSongs = [makeBandSong(), makeBandSong()];

      const dtos = BandSongResponseDto.fromEntities(bandSongs);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(BandSongResponseDto);
    });

    it('should return an empty array when given an empty list', () => {
      expect(BandSongResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
