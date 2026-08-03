import { BandSetlistController } from '@http/band-setlist/band-setlist.controller';
import type { CreateBandSetlistUseCaseInterface } from '@usecase/band-setlist/interfaces/create-band-setlist.usecase.interface';
import type { ListBandSetlistsUseCaseInterface } from '@usecase/band-setlist/interfaces/list-band-setlists.usecase.interface';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band-setlist/create-band-setlist.dto';
import { ListBandSetlistsResponseDto } from '@shared/communication/dtos/band-setlist/list-band-setlists-response.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';

const makeDto = (): CreateBandSetlistDto => ({
  name: 'Show de Sábado',
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

const makeBandSetlist = (id: string): BandSetlistEntity =>
  ({
    id,
    band_id: 'band-uuid',
    name: 'Show de Sábado',
  }) as unknown as BandSetlistEntity;

describe('BandSetlistController', () => {
  let controller: BandSetlistController;
  let mockCreateUseCase: jest.Mocked<CreateBandSetlistUseCaseInterface>;
  let mockListUseCase: jest.Mocked<ListBandSetlistsUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockListUseCase = { execute: jest.fn().mockResolvedValue([]) };
    controller = new BandSetlistController(mockCreateUseCase, mockListUseCase);
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

    it('should return a ListBandSetlistsResponseDto whose data key holds the mapped setlists', async () => {
      const bandSetlists = [
        makeBandSetlist('setlist-1'),
        makeBandSetlist('setlist-2'),
      ];
      mockListUseCase.execute.mockResolvedValueOnce(bandSetlists);

      const result = await controller.list(makeParams());

      expect(result).toEqual(
        ListBandSetlistsResponseDto.fromEntities(bandSetlists),
      );
    });

    it('should return an empty data array when the band has no setlists', async () => {
      const result = await controller.list(makeParams());

      expect(result.data).toEqual([]);
    });
  });
});
