jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/band/band-booking-typeorm.entity', () => ({
  BandBookingTypeormEntity: class BandBookingTypeormEntity {},
}));

import { BandBookingRepository } from '@infrastructure/repository/band/band-booking.repository';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { Repository } from 'typeorm';

describe('BandBookingRepository', () => {
  let bandBookingRepository: BandBookingRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
    };
    bandBookingRepository = new BandBookingRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(bandBookingRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const bandBooking = {
      band_id: 'band-uuid',
      title: 'Show Bar do Zé',
    } as unknown as BandBookingEntity;
    const typeormEntity = { ...bandBooking };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandBookingRepository.save(bandBooking);

    expect(typeormRepo.create).toHaveBeenCalledWith(bandBooking);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const bandBooking = {
      band_id: 'band-uuid',
      title: 'Show Bar do Zé',
    } as unknown as BandBookingEntity;
    const typeormEntity = { ...bandBooking };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandBookingRepository.save(bandBooking);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });

  describe('findAllByBandId', () => {
    it('should call repository.find filtering by band_id and ordering chronologically', async () => {
      await bandBookingRepository.findAllByBandId('band-uuid');

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { band_id: 'band-uuid' },
        order: { date: 'ASC', start_time: 'ASC', created_at: 'ASC' },
      });
    });

    it('should return the bookings returned by the repository', async () => {
      const bandBookings = [
        { id: 'booking-1', band_id: 'band-uuid' },
        { id: 'booking-2', band_id: 'band-uuid' },
      ];
      typeormRepo.find.mockResolvedValueOnce(bandBookings as any);

      const result = await bandBookingRepository.findAllByBandId('band-uuid');

      expect(result).toBe(bandBookings);
    });

    it('should return an empty array when the band has no bookings', async () => {
      const result = await bandBookingRepository.findAllByBandId('band-uuid');

      expect(result).toEqual([]);
    });
  });
});
