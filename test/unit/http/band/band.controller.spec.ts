import { BandController } from '@http/band/band.controller';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces/create-band.usecase.interface';
import type { ListBandsByUserUseCaseInterface } from '@usecase/band/interfaces/list-bands-by-user.usecase.interface';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { ListBandsResponseDto } from '@shared/communication/dtos/band/list-bands-response.dto';
import { BandEntity } from '@domain/entities/band/band.entity';

const makeDto = (): CreateBandDto => ({
  name: 'The Beatles',
  genre: 'Rock',
  state: 'England',
  city: 'Liverpool',
  neighborhood: 'Woolton',
  address: '251 Menlove Avenue',
  started_at: new Date('1960-01-01'),
});

const makeRequest = (userId = 'user-uuid') => ({
  user: { id: userId, email: 'john@example.com' },
});

const makeBand = (id: string): BandEntity =>
  ({ id, name: 'The Beatles' }) as unknown as BandEntity;

describe('BandController', () => {
  let controller: BandController;
  let mockCreateUseCase: jest.Mocked<CreateBandUseCaseInterface>;
  let mockListUseCase: jest.Mocked<ListBandsByUserUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockListUseCase = { execute: jest.fn().mockResolvedValue([]) };
    controller = new BandController(mockCreateUseCase, mockListUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call useCase.execute with the dto and the authenticated user id', async () => {
      const dto = makeDto();
      const request = makeRequest();

      await controller.create(dto, request);

      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(
        dto,
        request.user.id,
      );
    });

    it('should return void (HTTP 201 with no body)', async () => {
      const result = await controller.create(makeDto(), makeRequest());

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should call useCase.execute with the authenticated user id', async () => {
      const request = makeRequest();

      await controller.list(request);

      expect(mockListUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(request.user.id);
    });

    it('should return a ListBandsResponseDto whose data key holds the mapped bands', async () => {
      const bands = [makeBand('band-1'), makeBand('band-2')];
      mockListUseCase.execute.mockResolvedValueOnce(bands);

      const result = await controller.list(makeRequest());

      expect(result).toEqual(ListBandsResponseDto.fromEntities(bands));
    });

    it('should return an empty data array when the user has no bands', async () => {
      const result = await controller.list(makeRequest());

      expect(result.data).toEqual([]);
    });
  });
});
