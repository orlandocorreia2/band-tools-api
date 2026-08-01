import { ListBandsResponseDto } from '@shared/communication/dtos/band/list-bands-response.dto';
import { BandResponseDto } from '@shared/communication/dtos/band/band-response.dto';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandStatusEnum } from '@shared/commons/enums/band.enum';

const makeBand = (id: string): BandEntity =>
  new BandEntity({
    id,
    name: 'The Beatles',
    genre: 'Rock',
    state: 'England',
    city: 'Liverpool',
    neighborhood: 'Woolton',
    address: '251 Menlove Avenue',
    started_at: new Date('1960-01-01'),
    status: BandStatusEnum.Active,
  });

describe('ListBandsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped bands under the data key', () => {
      const bands = [makeBand('band-1'), makeBand('band-2')];

      const dto = ListBandsResponseDto.fromEntities(bands);

      expect(dto.data).toEqual(BandResponseDto.fromEntities(bands));
    });

    it('should expose an empty array under the data key when given no bands', () => {
      const dto = ListBandsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
