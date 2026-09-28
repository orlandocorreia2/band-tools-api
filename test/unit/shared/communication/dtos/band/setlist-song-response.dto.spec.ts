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

const makeDetailedBandSong = (): BandSongEntity => ({
  id: 'song-uuid',
  band_id: 'band-uuid',
  title: 'Come As You Are',
  tuning: 'Drop D',
  tonality: 'E Minor',
  bpm: 120,
  duration: 219,
  lyrics: 'Letra da música...',
  notes: 'Tocar mais devagar no refrão',
  created_at: new Date('2026-07-01T12:00:00.000Z'),
  updated_at: new Date('2026-07-01T12:00:00.000Z'),
});

describe('SetlistSongResponseDto', () => {
  describe('fromEntity', () => {
    it('should map the link fields and the song details', () => {
      const bandSetlistSong = makeBandSetlistSong();
      const bandSong = makeDetailedBandSong();

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
        tuning: bandSong.tuning,
        tonality: bandSong.tonality,
        bpm: bandSong.bpm,
        duration: bandSong.duration,
        lyrics: bandSong.lyrics,
        notes: bandSong.notes,
        created_at: bandSetlistSong.created_at,
        updated_at: bandSetlistSong.updated_at,
      });
    });

    it('should map missing song details to null', () => {
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
        tuning: null,
        tonality: null,
        bpm: null,
        duration: null,
        lyrics: null,
        notes: null,
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
