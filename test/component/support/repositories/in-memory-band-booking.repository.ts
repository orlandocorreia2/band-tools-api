import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandBookingRepository implements IBandBookingRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandBooking: BandBookingEntity): Promise<void> {
    this.store.bandBookings.add(bandBooking);
    return Promise.resolve();
  }
}
