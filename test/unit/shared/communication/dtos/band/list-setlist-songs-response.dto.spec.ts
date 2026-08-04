import { ListSetlistSongsResponseDto } from '@shared/communication/dtos/band/list-setlist-songs-response.dto';
import { SetlistSongResponseDto } from '@shared/communication/dtos/band/setlist-song-response.dto';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makePair = (position: number) => ({
  bandSetlistSong: {
    id: `link-${position}`,
    band_setlist_id: 'setlist-uuid',
    band_song_id: `song-${position}`,
    position,
  } as BandSetlistSongEntity,
  bandSong: {
    id: `song-${position}`,
    band_id: 'band-uuid',
    title: `Song ${position}`,
  } as BandSongEntity,
});

describe('ListSetlistSongsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped setlist songs under the data key', () => {
      const pairs = [makePair(1), makePair(2)];

      const dto = ListSetlistSongsResponseDto.fromEntities(pairs);

      expect(dto.data).toEqual(SetlistSongResponseDto.fromEntities(pairs));
    });

    it('should expose an empty array under the data key when given no setlist songs', () => {
      const dto = ListSetlistSongsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
