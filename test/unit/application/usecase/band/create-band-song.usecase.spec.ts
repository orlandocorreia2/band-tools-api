import { CreateBandSongUseCase } from '@usecase/band/create-band-song.usecase';
import type { CreateBandSongUseCaseInterface } from '@usecase/band/interfaces';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { CreateBandSongDto } from '@shared/communication/dtos/band/create-band-song.dto';

const bandId = 'band-uuid';

const makeDto = (): CreateBandSongDto => ({
  title: 'Come As You Are',
});

describe('CreateBandSongUseCase', () => {
  let useCase: CreateBandSongUseCaseInterface;
  let bandSongRepository: jest.Mocked<IBandSongRepository>;

  beforeEach(() => {
    bandSongRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findAllByIds: jest.fn().mockResolvedValue([]),
    };
    useCase = new CreateBandSongUseCase(bandSongRepository);
  });

  it('should call bandSongRepository.save with a BandSongEntity instance', async () => {
    await useCase.execute(bandId, makeDto());

    expect(bandSongRepository.save).toHaveBeenCalledTimes(1);
    expect(bandSongRepository.save).toHaveBeenCalledWith(
      expect.any(BandSongEntity),
    );
  });

  it('should create BandSongEntity with the correct props from dto and bandId', async () => {
    const dto = {
      ...makeDto(),
      tuning: 'Drop D',
      tonality: 'E Minor',
      bpm: 120,
      duration: 219,
      lyrics: 'Letra da música...',
      notes: 'Tocar mais devagar no refrão',
    };
    await useCase.execute(bandId, dto);

    const savedSong: BandSongEntity = bandSongRepository.save.mock.calls[0][0];
    expect(savedSong.band_id).toBe(bandId);
    expect(savedSong.title).toBe(dto.title);
    expect(savedSong.tuning).toBe(dto.tuning);
    expect(savedSong.tonality).toBe(dto.tonality);
    expect(savedSong.bpm).toBe(dto.bpm);
    expect(savedSong.duration).toBe(dto.duration);
    expect(savedSong.lyrics).toBe(dto.lyrics);
    expect(savedSong.notes).toBe(dto.notes);
  });

  it('should leave optional fields undefined when not provided in dto', async () => {
    await useCase.execute(bandId, makeDto());

    const savedSong: BandSongEntity = bandSongRepository.save.mock.calls[0][0];
    expect(savedSong.tuning).toBeUndefined();
    expect(savedSong.tonality).toBeUndefined();
    expect(savedSong.bpm).toBeUndefined();
    expect(savedSong.duration).toBeUndefined();
    expect(savedSong.lyrics).toBeUndefined();
    expect(savedSong.notes).toBeUndefined();
  });

  it('should return void', async () => {
    const result = await useCase.execute(bandId, makeDto());

    expect(result).toBeUndefined();
  });
});
