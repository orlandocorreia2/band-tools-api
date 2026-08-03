jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock(
  '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity',
  () => ({
    BandSetlistTypeormEntity: class BandSetlistTypeormEntity {},
  }),
);

import { BandSetlistRepository } from '@infrastructure/repository/band-setlist/band-setlist.repository';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';
import { Repository } from 'typeorm';

describe('BandSetlistRepository', () => {
  let bandSetlistRepository: BandSetlistRepository;
  let typeormRepo: jest.Mocked<Pick<Repository<any>, 'create' | 'save'>>;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    bandSetlistRepository = new BandSetlistRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(bandSetlistRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const bandSetlist = {
      band_id: 'band-uuid',
      name: 'Show de Sábado',
    } as unknown as BandSetlistEntity;
    const typeormEntity = { ...bandSetlist };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSetlistRepository.save(bandSetlist);

    expect(typeormRepo.create).toHaveBeenCalledWith(bandSetlist);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const bandSetlist = {
      band_id: 'band-uuid',
      name: 'Show de Sábado',
    } as unknown as BandSetlistEntity;
    const typeormEntity = { ...bandSetlist };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSetlistRepository.save(bandSetlist);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });
});
