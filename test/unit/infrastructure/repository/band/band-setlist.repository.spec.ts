jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/band/band-setlist-typeorm.entity', () => ({
  BandSetlistTypeormEntity: class BandSetlistTypeormEntity {},
}));

import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { Repository } from 'typeorm';

describe('BandSetlistRepository', () => {
  let bandSetlistRepository: BandSetlistRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find' | 'findOneBy'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn(),
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

  describe('findAllByBandId', () => {
    const bandId = 'band-uuid';

    it('should call repository.find filtering by band_id and ordering by created_at ASC', async () => {
      await bandSetlistRepository.findAllByBandId(bandId);

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { band_id: bandId },
        order: { created_at: 'ASC' },
      });
    });

    it('should return the setlists found by the query', async () => {
      const setlists = [{ id: 'setlist-1' }, { id: 'setlist-2' }];
      typeormRepo.find.mockResolvedValueOnce(setlists);

      const result = await bandSetlistRepository.findAllByBandId(bandId);

      expect(result).toBe(setlists);
    });

    it('should return an empty array when the band has no setlists', async () => {
      const result = await bandSetlistRepository.findAllByBandId(bandId);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should call repository.findOneBy with the given id and return the found setlist', async () => {
      const setlist = { id: 'setlist-uuid', band_id: 'band-uuid' };
      typeormRepo.findOneBy.mockResolvedValue(setlist);

      const result = await bandSetlistRepository.findById('setlist-uuid');

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: 'setlist-uuid',
      });
      expect(result).toBe(setlist);
    });

    it('should return null when no setlist is found', async () => {
      typeormRepo.findOneBy.mockResolvedValue(null);

      const result = await bandSetlistRepository.findById('missing-uuid');

      expect(result).toBeNull();
    });
  });
});
