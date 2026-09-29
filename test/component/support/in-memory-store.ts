import { Injectable } from '@nestjs/common';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandMemberEntity } from '@domain/entities/band/band-member.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { UserEntity } from '@domain/entities/user/user.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { InMemoryCollection } from './in-memory-collection';

/**
 * Shared state for every in-memory repository of one component-test app.
 * Shared so that cross-table writes (e.g. saveWithOwner creating a band member) stay consistent.
 */
@Injectable()
export class InMemoryStore {
  readonly users = new InMemoryCollection<UserEntity>();
  readonly bands = new InMemoryCollection<BandEntity>();
  readonly bandMembers = new InMemoryCollection<BandMemberEntity>();
  readonly bandSongs = new InMemoryCollection<BandSongEntity>();
  readonly bandSetlists = new InMemoryCollection<BandSetlistEntity>();
  readonly bandSetlistSongs = new InMemoryCollection<BandSetlistSongEntity>();
  readonly bandBookings = new InMemoryCollection<BandBookingEntity>();
  readonly contacts = new InMemoryCollection<ContactEntity>();

  clearAll(): void {
    [
      this.users,
      this.bands,
      this.bandMembers,
      this.bandSongs,
      this.bandSetlists,
      this.bandSetlistSongs,
      this.bandBookings,
      this.contacts,
    ].forEach((collection) => collection.clear());
  }
}
