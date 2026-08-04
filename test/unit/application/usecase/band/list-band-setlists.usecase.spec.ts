import { ListBandSetlistsUseCase } from '@usecase/band/list-band-setlists.usecase';
import type { ListBandSetlistsUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';

const bandId = 'band-uuid';

const makeBandSetlist = (id: string): BandSetlistEntity =>
  ({
    id,
    band_id: bandId,
    name: 'Show de Sábado',
  }) as unknown as BandSetlistEntity;

describe('ListBandSetlistsUseCase', () => {
  let useCase: ListBandSetlistsUseCaseInterface;
  let bandSetlistRepository: jest.Mocked<IBandSetlistRepository>;

  beforeEach(() => {
    bandSetlistRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    useCase = new ListBandSetlistsUseCase(bandSetlistRepository);
  });

  it('should call repository.findAllByBandId with the given bandId', async () => {
    await useCase.execute(bandId);

    expect(bandSetlistRepository.findAllByBandId).toHaveBeenCalledWith(bandId);
  });

  it('should return the setlists returned by the repository', async () => {
    const setlists = [
      makeBandSetlist('setlist-1'),
      makeBandSetlist('setlist-2'),
    ];
    bandSetlistRepository.findAllByBandId.mockResolvedValueOnce(setlists);

    const result = await useCase.execute(bandId);

    expect(result).toBe(setlists);
  });

  it('should return an empty array when the repository finds no setlists', async () => {
    const result = await useCase.execute(bandId);

    expect(result).toEqual([]);
  });
});
