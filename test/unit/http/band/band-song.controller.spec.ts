import { BandSongController } from '@http/band/band-song.controller';
import type { CreateBandSongUseCaseInterface } from '@usecase/band/interfaces/create-band-song.usecase.interface';
import type { ListBandSongsUseCaseInterface } from '@usecase/band/interfaces/list-band-songs.usecase.interface';
import { CreateBandSongDto } from '@shared/communication/dtos/band/create-band-song.dto';
import { ListBandSongsResponseDto } from '@shared/communication/dtos/band/list-band-songs-response.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeDto = (): CreateBandSongDto => ({
  title: 'Come As You Are',
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

const makeBandSong = (id: string): BandSongEntity =>
  ({
    id,
    band_id: 'band-uuid',
    title: 'Come As You Are',
  }) as unknown as BandSongEntity;

describe('BandSongController', () => {
  let controller: BandSongController;
  let mockCreateUseCase: jest.Mocked<CreateBandSongUseCaseInterface>;
  let mockListUseCase: jest.Mocked<ListBandSongsUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockListUseCase = { execute: jest.fn().mockResolvedValue([]) };
    controller = new BandSongController(mockCreateUseCase, mockListUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call useCase.execute with the params.id and dto', async () => {
      const dto = makeDto();
      const params = makeParams();

      await controller.create(params, dto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(params.id, dto);
    });

    it('should return void (HTTP 201 with no body)', async () => {
      const result = await controller.create(makeParams(), makeDto());

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should call useCase.execute with the params.id', async () => {
      const params = makeParams();

      await controller.list(params);

      expect(mockListUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(params.id);
    });

    it('should return a ListBandSongsResponseDto whose data key holds the mapped songs', async () => {
      const bandSongs = [makeBandSong('song-1'), makeBandSong('song-2')];
      mockListUseCase.execute.mockResolvedValueOnce(bandSongs);

      const result = await controller.list(makeParams());

      expect(result).toEqual(ListBandSongsResponseDto.fromEntities(bandSongs));
    });

    it('should return an empty data array when the band has no songs', async () => {
      const result = await controller.list(makeParams());

      expect(result.data).toEqual([]);
    });
  });
});
