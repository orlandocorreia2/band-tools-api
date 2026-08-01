import { BandSongController } from '@http/band-song/band-song.controller';
import type { CreateBandSongUseCaseInterface } from '@usecase/band-song/interfaces/create-band-song.usecase.interface';
import { CreateBandSongDto } from '@shared/communication/dtos/band-song/create-band-song.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';

const makeDto = (): CreateBandSongDto => ({
  title: 'Come As You Are',
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

describe('BandSongController', () => {
  let controller: BandSongController;
  let mockUseCase: jest.Mocked<CreateBandSongUseCaseInterface>;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new BandSongController(mockUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call useCase.execute with the params.id and dto', async () => {
    const dto = makeDto();
    const params = makeParams();

    await controller.create(params, dto);

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(params.id, dto);
  });

  it('should return void (HTTP 201 with no body)', async () => {
    const result = await controller.create(makeParams(), makeDto());

    expect(result).toBeUndefined();
  });
});
