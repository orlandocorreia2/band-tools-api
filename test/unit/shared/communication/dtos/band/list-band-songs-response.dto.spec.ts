import { ListBandSongsResponseDto } from '@shared/communication/dtos/band/list-band-songs-response.dto';
import { BandSongResponseDto } from '@shared/communication/dtos/band/band-song-response.dto';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeBandSong = (id: string): BandSongEntity =>
  new BandSongEntity({
    id,
    band_id: 'band-uuid',
    title: 'Come As You Are',
  });

describe('ListBandSongsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped songs under the data key', () => {
      const bandSongs = [makeBandSong('song-1'), makeBandSong('song-2')];

      const dto = ListBandSongsResponseDto.fromEntities(bandSongs);

      expect(dto.data).toEqual(BandSongResponseDto.fromEntities(bandSongs));
    });

    it('should expose an empty array under the data key when given no songs', () => {
      const dto = ListBandSongsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
