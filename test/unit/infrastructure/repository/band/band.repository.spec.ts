jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/band/band-typeorm.entity', () => ({
  BandTypeormEntity: class BandTypeormEntity {},
}));

import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandEntity } from '@domain/entities/band/band.entity';
import { Repository } from 'typeorm';

describe('BandRepository', () => {
  let bandRepository: BandRepository;
  let typeormRepo: jest.Mocked<Pick<Repository<any>, 'create' | 'save'>>;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    bandRepository = new BandRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(bandRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const band = { id: 'uuid', name: 'The Beatles' } as unknown as BandEntity;
    const typeormEntity = { id: 'uuid', name: 'The Beatles' };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandRepository.save(band);

    expect(typeormRepo.create).toHaveBeenCalledWith(band);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const band = { id: 'uuid', name: 'The Beatles' } as unknown as BandEntity;
    const typeormEntity = { id: 'uuid', name: 'The Beatles' };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandRepository.save(band);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });
});
