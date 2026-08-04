import { SetlistSongResponseDto } from '@shared/communication/dtos/band/setlist-song-response.dto';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeBandSetlistSong = (): BandSetlistSongEntity => ({
  id: 'link-uuid',
  band_setlist_id: 'setlist-uuid',
  band_song_id: 'song-uuid',
  position: 2,
  created_at: new Date('2026-08-03T12:00:00.000Z'),
  updated_at: new Date('2026-08-03T12:00:00.000Z'),
});

const makeBandSong = (): BandSongEntity =>
  ({
    id: 'song-uuid',
    band_id: 'band-uuid',
    title: 'Come As You Are',
  }) as BandSongEntity;

describe('SetlistSongResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all fields from the link and the song title', () => {
      const bandSetlistSong = makeBandSetlistSong();
      const bandSong = makeBandSong();

      const dto = SetlistSongResponseDto.fromEntity({
        bandSetlistSong,
        bandSong,
      });

      expect(dto).toEqual({
        id: bandSetlistSong.id,
        band_setlist_id: bandSetlistSong.band_setlist_id,
        band_song_id: bandSetlistSong.band_song_id,
        position: bandSetlistSong.position,
        title: bandSong.title,
        created_at: bandSetlistSong.created_at,
        updated_at: bandSetlistSong.updated_at,
      });
    });
  });

  describe('fromEntities', () => {
    it('should map a list of pairs to a list of SetlistSongResponseDto', () => {
      const pairs = [
        { bandSetlistSong: makeBandSetlistSong(), bandSong: makeBandSong() },
        { bandSetlistSong: makeBandSetlistSong(), bandSong: makeBandSong() },
      ];

      const dtos = SetlistSongResponseDto.fromEntities(pairs);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(SetlistSongResponseDto);
    });

    it('should return an empty array when given an empty list', () => {
      expect(SetlistSongResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
