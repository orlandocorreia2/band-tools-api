import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';

export interface IBandBookingRepository {
  save(bandBooking: BandBookingEntity): Promise<void>;
  findAllByBandId(bandId: string): Promise<BandBookingEntity[]>;
}
