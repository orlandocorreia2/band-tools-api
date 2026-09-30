import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

export type BandBookingWithContact = {
  bandBooking: BandBookingEntity;
  contact: ContactEntity;
};

export interface ListBandBookingsUseCaseInterface {
  execute(bandId: string): Promise<BandBookingWithContact[]>;
}
