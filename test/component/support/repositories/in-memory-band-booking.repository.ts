import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandBookingRepository implements IBandBookingRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandBooking: BandBookingEntity): Promise<void> {
    this.store.bandBookings.add(bandBooking);
    return Promise.resolve();
  }

  findAllByBandId(bandId: string): Promise<BandBookingEntity[]> {
    const bandBookings = this.store.bandBookings.filter(
      (bandBooking) => bandBooking.band_id === bandId,
    );
    return Promise.resolve(bandBookings.sort(byDateThenStartTime));
  }
}

function byDateThenStartTime(
  first: BandBookingEntity,
  second: BandBookingEntity,
): number {
  const byDate = first.date.getTime() - second.date.getTime();

  if (byDate !== 0) {
    return byDate;
  }

  return first.start_time.localeCompare(second.start_time);
}
