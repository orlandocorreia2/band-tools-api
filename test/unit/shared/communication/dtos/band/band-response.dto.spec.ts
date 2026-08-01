import { BandResponseDto } from '@shared/communication/dtos/band/band-response.dto';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandStatusEnum } from '@shared/commons/enums/band.enum';

const makeBand = (): BandEntity =>
  new BandEntity({
    id: 'band-uuid',
    name: 'The Beatles',
    genre: 'Rock',
    state: 'England',
    city: 'Liverpool',
    neighborhood: 'Woolton',
    address: '251 Menlove Avenue',
    started_at: new Date('1960-01-01'),
    status: BandStatusEnum.Active,
    description: 'Legendary rock band',
    image: 'https://img.com/x.jpg',
  });

describe('BandResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all fields from a BandEntity', () => {
      const band = makeBand();

      const dto = BandResponseDto.fromEntity(band);

      expect(dto).toEqual({
        id: band.id,
        name: band.name,
        genre: band.genre,
        state: band.state,
        city: band.city,
        neighborhood: band.neighborhood,
        address: band.address,
        started_at: band.started_at,
        status: band.status,
        description: band.description,
        image: band.image,
        created_at: band.created_at,
        updated_at: band.updated_at,
      });
    });
  });

  describe('fromEntities', () => {
    it('should map a list of BandEntity to a list of BandResponseDto', () => {
      const bands = [makeBand(), makeBand()];

      const dtos = BandResponseDto.fromEntities(bands);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(BandResponseDto);
    });

    it('should return an empty array when given an empty list', () => {
      expect(BandResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
