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
  let typeormRepo: jest.Mocked<Pick<Repository<any>, 'create' | 'save'>>;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
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
});
