import { ListBandsByUserUseCase } from '@usecase/band/list-bands-by-user.usecase';
import type { ListBandsByUserUseCaseInterface } from '@usecase/band/interfaces';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { BandEntity } from '@domain/entities/band/band.entity';

const userId = 'user-uuid';

const makeBand = (id: string): BandEntity =>
  ({ id, name: 'The Beatles' }) as unknown as BandEntity;

describe('ListBandsByUserUseCase', () => {
  let useCase: ListBandsByUserUseCaseInterface;
  let bandRepository: jest.Mocked<IBandRepository>;

  beforeEach(() => {
    bandRepository = {
      saveWithOwner: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findAllByUserId: jest.fn().mockResolvedValue([]),
    };
    useCase = new ListBandsByUserUseCase(bandRepository);
  });

  it('should call repository.findAllByUserId with the given userId', async () => {
    await useCase.execute(userId);

    expect(bandRepository.findAllByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return the bands returned by the repository', async () => {
    const bands = [makeBand('band-1'), makeBand('band-2')];
    bandRepository.findAllByUserId.mockResolvedValueOnce(bands);

    const result = await useCase.execute(userId);

    expect(result).toBe(bands);
  });

  it('should return an empty array when the repository finds no bands', async () => {
    const result = await useCase.execute(userId);

    expect(result).toEqual([]);
  });
});
