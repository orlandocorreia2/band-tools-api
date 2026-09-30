import { BandBookingController } from '@http/band/band-booking.controller';
import type { CreateBandBookingUseCaseInterface } from '@usecase/band/interfaces/create-band-booking.usecase.interface';
import type {
  BandBookingWithContact,
  ListBandBookingsUseCaseInterface,
} from '@usecase/band/interfaces/list-band-bookings.usecase.interface';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';
import { ListBandBookingsResponseDto } from '@shared/communication/dtos/band/list-band-bookings-response.dto';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makeDto = (): CreateBandBookingDto => ({
  title: 'Show Bar do Zé',
  contact_id: 'contact-uuid',
  date: new Date('2026-09-12'),
  start_time: '22:00',
  duration: '1 hora',
  fee: 800,
});

const makeParams = (id = 'band-uuid'): FindIdParamDto => ({ id });

const makeRequest = (userId = 'user-uuid') => ({ user: { id: userId } });

const makeBandBookingWithContact = (): BandBookingWithContact => ({
  bandBooking: new BandBookingEntity({
    id: 'booking-uuid',
    band_id: 'band-uuid',
    title: 'Show Bar do Zé',
    contact_id: 'contact-uuid',
    date: new Date('2026-09-12T00:00:00.000Z'),
    start_time: '22:00',
    duration: '1 hora',
    fee: 800,
  }),
  contact: new ContactEntity({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
  }),
});

describe('BandBookingController', () => {
  let controller: BandBookingController;
  let mockCreateUseCase: jest.Mocked<CreateBandBookingUseCaseInterface>;
  let mockListUseCase: jest.Mocked<ListBandBookingsUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockListUseCase = { execute: jest.fn().mockResolvedValue([]) };
    controller = new BandBookingController(mockCreateUseCase, mockListUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call useCase.execute with params.id, the authenticated userId and dto', async () => {
      const dto = makeDto();
      const params = makeParams();
      const request = makeRequest();

      await controller.create(params, dto, request);

      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(
        params.id,
        request.user.id,
        dto,
      );
    });

    it('should return void (HTTP 201 with no body)', async () => {
      const result = await controller.create(
        makeParams(),
        makeDto(),
        makeRequest(),
      );

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should call listUseCase.execute with params.id', async () => {
      const params = makeParams();

      await controller.list(params);

      expect(mockListUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(params.id);
    });

    it('should return the bookings wrapped by ListBandBookingsResponseDto', async () => {
      const bandBookings = [makeBandBookingWithContact()];
      mockListUseCase.execute.mockResolvedValueOnce(bandBookings);

      const result = await controller.list(makeParams());

      expect(result).toEqual(
        ListBandBookingsResponseDto.fromEntities(bandBookings),
      );
    });

    it('should return an empty data array when the band has no bookings', async () => {
      const result = await controller.list(makeParams());

      expect(result.data).toEqual([]);
    });
  });
});
