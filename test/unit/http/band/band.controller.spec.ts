import { BandController } from '@http/band/band.controller';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces/create-band.usecase.interface';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';

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

describe('BandController', () => {
  let controller: BandController;
  let mockUseCase: jest.Mocked<CreateBandUseCaseInterface>;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new BandController(mockUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call useCase.execute with the dto and the authenticated user id', async () => {
    const dto = makeDto();
    const request = makeRequest();

    await controller.create(dto, request);

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto, request.user.id);
  });

  it('should return void (HTTP 201 with no body)', async () => {
    const result = await controller.create(makeDto(), makeRequest());

    expect(result).toBeUndefined();
  });
});
