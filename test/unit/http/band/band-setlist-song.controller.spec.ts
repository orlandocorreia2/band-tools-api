import { BandSetlistSongController } from '@http/band/band-setlist-song.controller';
import type { AddSongToSetlistUseCaseInterface } from '@usecase/band/interfaces/add-song-to-setlist.usecase.interface';
import type { ListSetlistSongsUseCaseInterface } from '@usecase/band/interfaces/list-setlist-songs.usecase.interface';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { AddSongToSetlistParamDto } from '@shared/communication/dtos/band/add-song-to-setlist-param.dto';
import { ListSetlistSongsResponseDto } from '@shared/communication/dtos/band/list-setlist-songs-response.dto';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeDto = (): AddSongToSetlistDto => ({
  bandSongId: 'song-uuid',
  position: 1,
});

const makeParams = (
  id = 'band-uuid',
  setlistId = 'setlist-uuid',
): AddSongToSetlistParamDto => ({ id, setlistId });

const makeSetlistSong = (position: number) => ({
  bandSetlistSong: {
    id: `link-${position}`,
    band_setlist_id: 'setlist-uuid',
    band_song_id: `song-${position}`,
    position,
  } as BandSetlistSongEntity,
  bandSong: {
    id: `song-${position}`,
    band_id: 'band-uuid',
    title: `Song ${position}`,
  } as BandSongEntity,
});

describe('BandSetlistSongController', () => {
  let controller: BandSetlistSongController;
  let mockAddSongToSetlistUseCase: jest.Mocked<AddSongToSetlistUseCaseInterface>;
  let mockListSetlistSongsUseCase: jest.Mocked<ListSetlistSongsUseCaseInterface>;

  beforeEach(() => {
    mockAddSongToSetlistUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    mockListSetlistSongsUseCase = {
      execute: jest.fn().mockResolvedValue([]),
    };
    controller = new BandSetlistSongController(
      mockAddSongToSetlistUseCase,
      mockListSetlistSongsUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call useCase.execute with params.id, params.setlistId and dto', async () => {
      const dto = makeDto();
      const params = makeParams();

      await controller.create(params, dto);

      expect(mockAddSongToSetlistUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockAddSongToSetlistUseCase.execute).toHaveBeenCalledWith(
        params.id,
        params.setlistId,
        dto,
      );
    });

    it('should return void (HTTP 201 with no body)', async () => {
      const result = await controller.create(makeParams(), makeDto());

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should call useCase.execute with params.id and params.setlistId', async () => {
      const params = makeParams();

      await controller.list(params);

      expect(mockListSetlistSongsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockListSetlistSongsUseCase.execute).toHaveBeenCalledWith(
        params.id,
        params.setlistId,
      );
    });

    it('should return a ListSetlistSongsResponseDto whose data key holds the mapped setlist songs', async () => {
      const setlistSongs = [makeSetlistSong(1), makeSetlistSong(2)];
      mockListSetlistSongsUseCase.execute.mockResolvedValueOnce(setlistSongs);

      const result = await controller.list(makeParams());

      expect(result).toEqual(
        ListSetlistSongsResponseDto.fromEntities(setlistSongs),
      );
    });

    it('should return an empty data array when the setlist has no songs', async () => {
      const result = await controller.list(makeParams());

      expect(result.data).toEqual([]);
    });
  });
});
