import { ListSetlistSongsUseCase } from '@usecase/band/list-setlist-songs.usecase';
import type { ListSetlistSongsUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';

const bandId = 'band-uuid';
const setlistId = 'setlist-uuid';

const makeSetlist = (overrides: Partial<BandSetlistEntity> = {}) =>
  ({ id: setlistId, band_id: bandId, ...overrides }) as BandSetlistEntity;

const makeBandSetlistSong = (overrides: Partial<BandSetlistSongEntity> = {}) =>
  ({
    id: 'link-uuid',
    band_setlist_id: setlistId,
    band_song_id: 'song-uuid',
    position: 1,
    ...overrides,
  }) as BandSetlistSongEntity;

const makeSong = (overrides: Partial<BandSongEntity> = {}) =>
  ({
    id: 'song-uuid',
    band_id: bandId,
    title: 'Come As You Are',
    ...overrides,
  }) as BandSongEntity;

describe('ListSetlistSongsUseCase', () => {
  let useCase: ListSetlistSongsUseCaseInterface;
  let bandSetlistSongRepository: jest.Mocked<IBandSetlistSongRepository>;
  let bandSetlistRepository: jest.Mocked<IBandSetlistRepository>;
  let bandSongRepository: jest.Mocked<IBandSongRepository>;

  beforeEach(() => {
    bandSetlistSongRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandSetlistId: jest.fn().mockResolvedValue([]),
    };
    bandSetlistRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(makeSetlist()),
    };
    bandSongRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findAllByIds: jest.fn().mockResolvedValue([]),
    };
    useCase = new ListSetlistSongsUseCase(
      bandSetlistSongRepository,
      bandSetlistRepository,
      bandSongRepository,
    );
  });

  it('should look up the setlist by its id', async () => {
    await useCase.execute(bandId, setlistId);

    expect(bandSetlistRepository.findById).toHaveBeenCalledWith(setlistId);
  });

  it('should throw ApplicationNotFoundException when the setlist does not exist', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(bandId, setlistId)).rejects.toBeInstanceOf(
      ApplicationNotFoundException,
    );
  });

  it('should throw ApplicationNotFoundException when the setlist belongs to another band', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(
      makeSetlist({ band_id: 'another-band-uuid' }),
    );

    await expect(useCase.execute(bandId, setlistId)).rejects.toBeInstanceOf(
      ApplicationNotFoundException,
    );
  });

  it('should not query for songs when the setlist is invalid', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(bandId, setlistId)).rejects.toThrow();
    expect(
      bandSetlistSongRepository.findAllByBandSetlistId,
    ).not.toHaveBeenCalled();
  });

  it('should return an empty array without calling findAllByIds when the setlist has no songs', async () => {
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce([]);

    const result = await useCase.execute(bandId, setlistId);

    expect(result).toEqual([]);
    expect(bandSongRepository.findAllByIds).not.toHaveBeenCalled();
  });

  it('should fetch band songs in a single batch call with the ids from the links', async () => {
    const links = [
      makeBandSetlistSong({ band_song_id: 'song-1', position: 1 }),
      makeBandSetlistSong({ band_song_id: 'song-2', position: 2 }),
    ];
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce(
      links,
    );

    await useCase.execute(bandId, setlistId);

    expect(bandSongRepository.findAllByIds).toHaveBeenCalledWith([
      'song-1',
      'song-2',
    ]);
  });

  it('should return the links paired with their songs, ordered by position ascending', async () => {
    const link1 = makeBandSetlistSong({ band_song_id: 'song-1', position: 3 });
    const link2 = makeBandSetlistSong({ band_song_id: 'song-2', position: 1 });
    const link3 = makeBandSetlistSong({ band_song_id: 'song-3', position: 2 });
    const song1 = makeSong({ id: 'song-1' });
    const song2 = makeSong({ id: 'song-2' });
    const song3 = makeSong({ id: 'song-3' });
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce([
      link1,
      link2,
      link3,
    ]);
    bandSongRepository.findAllByIds.mockResolvedValueOnce([
      song1,
      song2,
      song3,
    ]);

    const result = await useCase.execute(bandId, setlistId);

    expect(result).toEqual([
      { bandSetlistSong: link2, bandSong: song2 },
      { bandSetlistSong: link3, bandSong: song3 },
      { bandSetlistSong: link1, bandSong: song1 },
    ]);
  });
});
