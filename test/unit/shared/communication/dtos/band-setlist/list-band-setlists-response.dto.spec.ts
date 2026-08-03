import { ListBandSetlistsResponseDto } from '@shared/communication/dtos/band-setlist/list-band-setlists-response.dto';
import { BandSetlistResponseDto } from '@shared/communication/dtos/band-setlist/band-setlist-response.dto';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';

const makeBandSetlist = (id: string): BandSetlistEntity =>
  new BandSetlistEntity({
    id,
    band_id: 'band-uuid',
    name: 'Show de Sábado',
  });

describe('ListBandSetlistsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped setlists under the data key', () => {
      const bandSetlists = [
        makeBandSetlist('setlist-1'),
        makeBandSetlist('setlist-2'),
      ];

      const dto = ListBandSetlistsResponseDto.fromEntities(bandSetlists);

      expect(dto.data).toEqual(
        BandSetlistResponseDto.fromEntities(bandSetlists),
      );
    });

    it('should expose an empty array under the data key when given no setlists', () => {
      const dto = ListBandSetlistsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
