import { AddSongToSetlistUseCase } from '@usecase/band/add-song-to-setlist.usecase';
import type { AddSongToSetlistUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';

const bandId = 'band-uuid';
const setlistId = 'setlist-uuid';

const makeDto = (): AddSongToSetlistDto => ({
  bandSongId: 'song-uuid',
  position: 1,
});

const makeSetlist = (overrides: Partial<BandSetlistEntity> = {}) =>
  ({ id: setlistId, band_id: bandId, ...overrides }) as BandSetlistEntity;

const makeSong = (overrides: Partial<BandSongEntity> = {}) =>
  ({ id: 'song-uuid', band_id: bandId, ...overrides }) as BandSongEntity;

describe('AddSongToSetlistUseCase', () => {
  let useCase: AddSongToSetlistUseCaseInterface;
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
      findById: jest.fn().mockResolvedValue(makeSong()),
      findAllByIds: jest.fn().mockResolvedValue([]),
    };
    useCase = new AddSongToSetlistUseCase(
      bandSetlistSongRepository,
      bandSetlistRepository,
      bandSongRepository,
    );
  });

  it('should look up the setlist and the song by their ids', async () => {
    const dto = makeDto();
    await useCase.execute(bandId, setlistId, dto);

    expect(bandSetlistRepository.findById).toHaveBeenCalledWith(setlistId);
    expect(bandSongRepository.findById).toHaveBeenCalledWith(dto.bandSongId);
  });

  it('should persist a BandSetlistSongEntity with the requested position when there is no collision', async () => {
    const dto = makeDto();
    await useCase.execute(bandId, setlistId, dto);

    expect(bandSetlistSongRepository.save).toHaveBeenCalledWith(
      expect.any(BandSetlistSongEntity),
    );
    const saved = bandSetlistSongRepository.save.mock.calls[0][0];
    expect(saved.band_setlist_id).toBe(setlistId);
    expect(saved.band_song_id).toBe(dto.bandSongId);
    expect(saved.position).toBe(dto.position);
  });

  it('should use the requested position when the setlist has no songs yet', async () => {
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce([]);

    await useCase.execute(bandId, setlistId, makeDto());

    const saved = bandSetlistSongRepository.save.mock.calls[0][0];
    expect(saved.position).toBe(1);
  });

  it('should reposition to MAX(position) + 1 when the requested position collides with an existing song', async () => {
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce([
      { position: 1 } as BandSetlistSongEntity,
      { position: 3 } as BandSetlistSongEntity,
    ]);

    await useCase.execute(bandId, setlistId, makeDto());

    const saved = bandSetlistSongRepository.save.mock.calls[0][0];
    expect(saved.position).toBe(4);
  });

  it('should allow the same song to be added more than once to the same setlist', async () => {
    bandSetlistSongRepository.findAllByBandSetlistId.mockResolvedValueOnce([
      { position: 2, band_song_id: 'song-uuid' } as BandSetlistSongEntity,
    ]);

    await expect(
      useCase.execute(bandId, setlistId, { ...makeDto(), position: 5 }),
    ).resolves.toBeUndefined();
    expect(bandSetlistSongRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ApplicationNotFoundException when the setlist does not exist', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should throw ApplicationNotFoundException when the setlist belongs to another band', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(
      makeSetlist({ band_id: 'another-band-uuid' }),
    );

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should not persist anything when the setlist is invalid', async () => {
    bandSetlistRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toThrow();
    expect(bandSongRepository.findById).not.toHaveBeenCalled();
    expect(bandSetlistSongRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ApplicationNotFoundException when the song does not exist', async () => {
    bandSongRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should throw ApplicationNotFoundException when the song belongs to another band', async () => {
    bandSongRepository.findById.mockResolvedValueOnce(
      makeSong({ band_id: 'another-band-uuid' }),
    );

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should not persist anything when the song is invalid', async () => {
    bandSongRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute(bandId, setlistId, makeDto()),
    ).rejects.toThrow();
    expect(bandSetlistSongRepository.save).not.toHaveBeenCalled();
  });
});
