import { BandSetlistResponseDto } from '@shared/communication/dtos/band/band-setlist-response.dto';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';

const makeBandSetlist = (): BandSetlistEntity =>
  new BandSetlistEntity({
    id: 'setlist-uuid',
    band_id: 'band-uuid',
    name: 'Show de Sábado',
  });

describe('BandSetlistResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all fields from a BandSetlistEntity', () => {
      const bandSetlist = makeBandSetlist();

      const dto = BandSetlistResponseDto.fromEntity(bandSetlist);

      expect(dto).toEqual({
        id: bandSetlist.id,
        band_id: bandSetlist.band_id,
        name: bandSetlist.name,
        created_at: bandSetlist.created_at,
        updated_at: bandSetlist.updated_at,
      });
    });
  });

  describe('fromEntities', () => {
    it('should map a list of BandSetlistEntity to a list of BandSetlistResponseDto', () => {
      const bandSetlists = [makeBandSetlist(), makeBandSetlist()];

      const dtos = BandSetlistResponseDto.fromEntities(bandSetlists);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(BandSetlistResponseDto);
    });

    it('should return an empty array when given an empty list', () => {
      expect(BandSetlistResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
