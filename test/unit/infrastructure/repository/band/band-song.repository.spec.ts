jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/band/band-song-typeorm.entity', () => ({
  BandSongTypeormEntity: class BandSongTypeormEntity {},
}));

import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { In, Repository } from 'typeorm';

describe('BandSongRepository', () => {
  let bandSongRepository: BandSongRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find' | 'findOneBy' | 'findBy'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn(),
      findBy: jest.fn().mockResolvedValue([]),
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

  describe('findById', () => {
    it('should call repository.findOneBy with the given id and return the found song', async () => {
      const song = { id: 'song-uuid', band_id: 'band-uuid' };
      typeormRepo.findOneBy.mockResolvedValue(song);

      const result = await bandSongRepository.findById('song-uuid');

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({ id: 'song-uuid' });
      expect(result).toBe(song);
    });

    it('should return null when no song is found', async () => {
      typeormRepo.findOneBy.mockResolvedValue(null);

      const result = await bandSongRepository.findById('missing-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findAllByIds', () => {
    it('should call repository.findBy with an In operator built from the given ids', async () => {
      const ids = ['song-1', 'song-2'];

      await bandSongRepository.findAllByIds(ids);

      expect(typeormRepo.findBy).toHaveBeenCalledWith({
        id: In(ids),
      });
    });

    it('should return the songs found by the query', async () => {
      const songs = [{ id: 'song-1' }, { id: 'song-2' }];
      typeormRepo.findBy.mockResolvedValueOnce(songs);

      const result = await bandSongRepository.findAllByIds([
        'song-1',
        'song-2',
      ]);

      expect(result).toBe(songs);
    });

    it('should return an empty array when no songs match the given ids', async () => {
      const result = await bandSongRepository.findAllByIds([]);

      expect(result).toEqual([]);
    });
  });
});
