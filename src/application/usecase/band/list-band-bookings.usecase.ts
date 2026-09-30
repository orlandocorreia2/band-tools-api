import { Injectable } from '@nestjs/common';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import type { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import type { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import {
  BandBookingWithContact,
  ListBandBookingsUseCaseInterface,
} from './interfaces';

@Injectable()
export class ListBandBookingsUseCase implements ListBandBookingsUseCaseInterface {
  constructor(
    private readonly bandBookingRepository: IBandBookingRepository,
    private readonly contactRepository: IContactRepository,
  ) {}

  async execute(bandId: string): Promise<BandBookingWithContact[]> {
    const bandBookings =
      await this.bandBookingRepository.findAllByBandId(bandId);
    const contacts = await this.fetchContacts(bandBookings);

    return this.pairWithContacts(bandBookings, contacts);
  }

  private async fetchContacts(
    bandBookings: BandBookingEntity[],
  ): Promise<ContactEntity[]> {
    if (bandBookings.length === 0) {
      return [];
    }

    const contactIds = [
      ...new Set(bandBookings.map((bandBooking) => bandBooking.contact_id)),
    ];

    return this.contactRepository.findAllByIds(contactIds);
  }

  private pairWithContacts(
    bandBookings: BandBookingEntity[],
    contacts: ContactEntity[],
  ): BandBookingWithContact[] {
    const contactsById = new Map(
      contacts.map((contact) => [contact.id, contact]),
    );

    return bandBookings
      .filter((bandBooking) => contactsById.has(bandBooking.contact_id))
      .map((bandBooking) => ({
        bandBooking,
        contact: contactsById.get(bandBooking.contact_id),
      }));
  }
}
