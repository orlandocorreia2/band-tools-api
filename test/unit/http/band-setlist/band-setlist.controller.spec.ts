import { BandSetlistController } from '@http/band-setlist/band-setlist.controller';
import type { CreateBandSetlistUseCaseInterface } from '@usecase/band-setlist/interfaces/create-band-setlist.usecase.interface';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band-setlist/create-band-setlist.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';

const makeDto = (): CreateBandSetlistDto => ({
  name: 'Show de Sábado',
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

describe('BandSetlistController', () => {
  let controller: BandSetlistController;
  let mockCreateUseCase: jest.Mocked<CreateBandSetlistUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new BandSetlistController(mockCreateUseCase);
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
});
