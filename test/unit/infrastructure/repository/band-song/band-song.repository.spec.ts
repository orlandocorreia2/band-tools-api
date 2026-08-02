jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock(
  '@infrastructure/entities/band-song/band-song-typeorm.entity',
  () => ({
    BandSongTypeormEntity: class BandSongTypeormEntity {},
  }),
);

import { BandSongRepository } from '@infrastructure/repository/band-song/band-song.repository';
import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';
import { Repository } from 'typeorm';

describe('BandSongRepository', () => {
  let bandSongRepository: BandSongRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
    };
    bandSongRepository = new BandSongRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(bandSongRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const bandSong = {
      band_id: 'band-uuid',
      title: 'Come As You Are',
    } as unknown as BandSongEntity;
    const typeormEntity = { ...bandSong };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSongRepository.save(bandSong);

    expect(typeormRepo.create).toHaveBeenCalledWith(bandSong);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const bandSong = {
      band_id: 'band-uuid',
      title: 'Come As You Are',
    } as unknown as BandSongEntity;
    const typeormEntity = { ...bandSong };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSongRepository.save(bandSong);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });

  describe('findAllByBandId', () => {
    const bandId = 'band-uuid';

    it('should call repository.find filtering by band_id and ordering by created_at ASC', async () => {
      await bandSongRepository.findAllByBandId(bandId);

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { band_id: bandId },
        order: { created_at: 'ASC' },
      });
    });

    it('should return the songs found by the query', async () => {
      const songs = [{ id: 'song-1' }, { id: 'song-2' }];
      typeormRepo.find.mockResolvedValueOnce(songs);

      const result = await bandSongRepository.findAllByBandId(bandId);

      expect(result).toBe(songs);
    });

    it('should return an empty array when the band has no songs', async () => {
      const result = await bandSongRepository.findAllByBandId(bandId);

      expect(result).toEqual([]);
    });
  });
});
