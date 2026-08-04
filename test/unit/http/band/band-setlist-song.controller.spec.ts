import { BandSetlistSongController } from '@http/band/band-setlist-song.controller';
import type { AddSongToSetlistUseCaseInterface } from '@usecase/band/interfaces/add-song-to-setlist.usecase.interface';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { AddSongToSetlistParamDto } from '@shared/communication/dtos/band/add-song-to-setlist-param.dto';

const makeDto = (): AddSongToSetlistDto => ({
  bandSongId: 'song-uuid',
  position: 1,
});

const makeParams = (
  id = 'band-uuid',
  setlistId = 'setlist-uuid',
): AddSongToSetlistParamDto => ({ id, setlistId });

describe('BandSetlistSongController', () => {
  let controller: BandSetlistSongController;
  let mockAddSongToSetlistUseCase: jest.Mocked<AddSongToSetlistUseCaseInterface>;

  beforeEach(() => {
    mockAddSongToSetlistUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    controller = new BandSetlistSongController(mockAddSongToSetlistUseCase);
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
});
