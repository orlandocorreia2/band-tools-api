import { Module, Provider, Type } from '@nestjs/common';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandMemberRepository } from '@infrastructure/repository/band/band-member.repository';
import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import { BandBookingRepository } from '@infrastructure/repository/band/band-booking.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { ContactRepository } from '@infrastructure/repository/contact/contact.repository';
import { InMemoryStore } from './in-memory-store';
import { InMemoryBandRepository } from './repositories/in-memory-band.repository';
import { InMemoryBandMemberRepository } from './repositories/in-memory-band-member.repository';
import { InMemoryBandSetlistRepository } from './repositories/in-memory-band-setlist.repository';
import { InMemoryBandSetlistSongRepository } from './repositories/in-memory-band-setlist-song.repository';
import { InMemoryBandSongRepository } from './repositories/in-memory-band-song.repository';
import { InMemoryBandBookingRepository } from './repositories/in-memory-band-booking.repository';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { InMemoryContactRepository } from './repositories/in-memory-contact.repository';

const REPLACEMENTS: [Type, new (store: InMemoryStore) => unknown][] = [
  [BandRepository, InMemoryBandRepository],
  [BandMemberRepository, InMemoryBandMemberRepository],
  [BandSetlistRepository, InMemoryBandSetlistRepository],
  [BandSetlistSongRepository, InMemoryBandSetlistSongRepository],
  [BandSongRepository, InMemoryBandSongRepository],
  [BandBookingRepository, InMemoryBandBookingRepository],
  [UserRepository, InMemoryUserRepository],
  [ContactRepository, InMemoryContactRepository],
];

const repositoryProviders: Provider[] = REPLACEMENTS.map(
  ([token, InMemoryRepository]) => ({
    provide: token,
    inject: [InMemoryStore],
    useFactory: (store: InMemoryStore) => new InMemoryRepository(store),
  }),
);

const tokens = REPLACEMENTS.map(([token]) => token);

/**
 * Drop-in replacement for PersistenceModule: same tokens (the repository classes),
 * in-memory implementations, no TypeORM.
 */
@Module({
  providers: [InMemoryStore, ...repositoryProviders],
  exports: [InMemoryStore, ...tokens],
})
export class InMemoryPersistenceModule {}
