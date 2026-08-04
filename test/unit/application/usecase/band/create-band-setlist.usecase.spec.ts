import { CreateBandSetlistUseCase } from '@usecase/band/create-band-setlist.usecase';
import type { CreateBandSetlistUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band/create-band-setlist.dto';

const bandId = 'band-uuid';

const makeDto = (): CreateBandSetlistDto => ({
  name: 'Show de Sábado',
});

describe('CreateBandSetlistUseCase', () => {
  let useCase: CreateBandSetlistUseCaseInterface;
  let bandSetlistRepository: jest.Mocked<IBandSetlistRepository>;

  beforeEach(() => {
    bandSetlistRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    useCase = new CreateBandSetlistUseCase(bandSetlistRepository);
  });

  it('should call bandSetlistRepository.save with a BandSetlistEntity instance', async () => {
    await useCase.execute(bandId, makeDto());

    expect(bandSetlistRepository.save).toHaveBeenCalledTimes(1);
    expect(bandSetlistRepository.save).toHaveBeenCalledWith(
      expect.any(BandSetlistEntity),
    );
  });

  it('should create BandSetlistEntity with the correct props from dto and bandId', async () => {
    const dto = makeDto();
    await useCase.execute(bandId, dto);

    const savedSetlist: BandSetlistEntity =
      bandSetlistRepository.save.mock.calls[0][0];
    expect(savedSetlist.band_id).toBe(bandId);
    expect(savedSetlist.name).toBe(dto.name);
  });

  it('should return void', async () => {
    const result = await useCase.execute(bandId, makeDto());

    expect(result).toBeUndefined();
  });
});
