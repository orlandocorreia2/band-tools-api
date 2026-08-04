import { ListBandSongsUseCase } from '@usecase/band/list-band-songs.usecase';
import type { ListBandSongsUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const bandId = 'band-uuid';

const makeBandSong = (id: string): BandSongEntity =>
  ({
    id,
    band_id: bandId,
    title: 'Come As You Are',
  }) as unknown as BandSongEntity;

describe('ListBandSongsUseCase', () => {
  let useCase: ListBandSongsUseCaseInterface;
  let bandSongRepository: jest.Mocked<IBandSongRepository>;

  beforeEach(() => {
    bandSongRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    useCase = new ListBandSongsUseCase(bandSongRepository);
  });

  it('should call repository.findAllByBandId with the given bandId', async () => {
    await useCase.execute(bandId);

    expect(bandSongRepository.findAllByBandId).toHaveBeenCalledWith(bandId);
  });

  it('should return the songs returned by the repository', async () => {
    const songs = [makeBandSong('song-1'), makeBandSong('song-2')];
    bandSongRepository.findAllByBandId.mockResolvedValueOnce(songs);

    const result = await useCase.execute(bandId);

    expect(result).toBe(songs);
  });

  it('should return an empty array when the repository finds no songs', async () => {
    const result = await useCase.execute(bandId);

    expect(result).toEqual([]);
  });
});
