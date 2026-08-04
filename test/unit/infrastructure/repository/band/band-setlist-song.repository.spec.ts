jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock(
  '@infrastructure/entities/band/band-setlist-song-typeorm.entity',
  () => ({
    BandSetlistSongTypeormEntity: class BandSetlistSongTypeormEntity {},
  }),
);

import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { Repository } from 'typeorm';

describe('BandSetlistSongRepository', () => {
  let bandSetlistSongRepository: BandSetlistSongRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
    };
    bandSetlistSongRepository = new BandSetlistSongRepository(
      typeormRepo as any,
    );
  });

  it('should be defined', () => {
    expect(bandSetlistSongRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const bandSetlistSong = {
      band_setlist_id: 'setlist-uuid',
      band_song_id: 'song-uuid',
      position: 1,
    } as unknown as BandSetlistSongEntity;
    const typeormEntity = { ...bandSetlistSong };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSetlistSongRepository.save(bandSetlistSong);

    expect(typeormRepo.create).toHaveBeenCalledWith(bandSetlistSong);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const bandSetlistSong = {
      band_setlist_id: 'setlist-uuid',
      band_song_id: 'song-uuid',
      position: 1,
    } as unknown as BandSetlistSongEntity;
    const typeormEntity = { ...bandSetlistSong };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandSetlistSongRepository.save(bandSetlistSong);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });

  describe('findAllByBandSetlistId', () => {
    const bandSetlistId = 'setlist-uuid';

    it('should call repository.find filtering by band_setlist_id and ordering by created_at ASC', async () => {
      await bandSetlistSongRepository.findAllByBandSetlistId(bandSetlistId);

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { band_setlist_id: bandSetlistId },
        order: { created_at: 'ASC' },
      });
    });

    it('should return the entries found by the query', async () => {
      const bandSetlistSongs = [{ id: 'link-1' }, { id: 'link-2' }];
      typeormRepo.find.mockResolvedValueOnce(bandSetlistSongs);

      const result =
        await bandSetlistSongRepository.findAllByBandSetlistId(bandSetlistId);

      expect(result).toBe(bandSetlistSongs);
    });

    it('should return an empty array when the setlist has no songs', async () => {
      const result =
        await bandSetlistSongRepository.findAllByBandSetlistId(bandSetlistId);

      expect(result).toEqual([]);
    });
  });
});
