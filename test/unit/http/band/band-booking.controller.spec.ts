import { BandBookingController } from '@http/band/band-booking.controller';
import type { CreateBandBookingUseCaseInterface } from '@usecase/band/interfaces/create-band-booking.usecase.interface';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';

const makeDto = (): CreateBandBookingDto => ({
  title: 'Show Bar do Zé',
  focal_point_name: 'Maria Souza',
  phone: '11987654321',
  date: new Date('2026-09-12'),
  start_time: '22:00',
  duration: '1 hora',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  fee: 800,
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

describe('BandBookingController', () => {
  let controller: BandBookingController;
  let mockCreateUseCase: jest.Mocked<CreateBandBookingUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new BandBookingController(mockCreateUseCase);
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
