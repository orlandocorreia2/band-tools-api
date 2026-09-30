import { DynamicModule, Module } from '@nestjs/common';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { ListBandsByUserUseCase } from '@usecase/band/list-bands-by-user.usecase';
import { CreateBandSetlistUseCase } from '@usecase/band/create-band-setlist.usecase';
import { ListBandSetlistsUseCase } from '@usecase/band/list-band-setlists.usecase';
import { AddSongToSetlistUseCase } from '@usecase/band/add-song-to-setlist.usecase';
import { ListSetlistSongsUseCase } from '@usecase/band/list-setlist-songs.usecase';
import { CreateBandSongUseCase } from '@usecase/band/create-band-song.usecase';
import { ListBandSongsUseCase } from '@usecase/band/list-band-songs.usecase';
import { CreateBandBookingUseCase } from '@usecase/band/create-band-booking.usecase';
import { ListBandBookingsUseCase } from '@usecase/band/list-band-bookings.usecase';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import { BandBookingRepository } from '@infrastructure/repository/band/band-booking.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { ContactRepository } from '@infrastructure/repository/contact/contact.repository';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';

@Module({})
export class BandFactoryModule {
  static readonly CREATE_BAND_USE_CASE = 'CreateBandUseCase';
  static readonly LIST_BANDS_BY_USER_USE_CASE = 'ListBandsByUserUseCase';
  static readonly CREATE_BAND_SETLIST_USE_CASE = 'CreateBandSetlistUseCase';
  static readonly LIST_BAND_SETLISTS_USE_CASE = 'ListBandSetlistsUseCase';
  static readonly ADD_SONG_TO_SETLIST_USE_CASE = 'AddSongToSetlistUseCase';
  static readonly LIST_SETLIST_SONGS_USE_CASE = 'ListSetlistSongsUseCase';
  static readonly CREATE_BAND_SONG_USE_CASE = 'CreateBandSongUseCase';
  static readonly LIST_BAND_SONGS_USE_CASE = 'ListBandSongsUseCase';
  static readonly CREATE_BAND_BOOKING_USE_CASE = 'CreateBandBookingUseCase';
  static readonly LIST_BAND_BOOKINGS_USE_CASE = 'ListBandBookingsUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandFactoryModule,
      imports: [PersistenceModule],
      providers: [
        {
          provide: BandFactoryModule.CREATE_BAND_USE_CASE,
          inject: [BandRepository, UserRepository],
          useFactory: (
            bandRepository: BandRepository,
            userRepository: UserRepository,
          ) => new CreateBandUseCase(bandRepository, userRepository),
        },
        {
          provide: BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
          inject: [BandRepository],
          useFactory: (bandRepository: BandRepository) =>
            new ListBandsByUserUseCase(bandRepository),
        },
        {
          provide: BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
          inject: [BandSetlistRepository],
          useFactory: (bandSetlistRepository: BandSetlistRepository) =>
            new CreateBandSetlistUseCase(bandSetlistRepository),
        },
        {
          provide: BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
          inject: [BandSetlistRepository],
          useFactory: (bandSetlistRepository: BandSetlistRepository) =>
            new ListBandSetlistsUseCase(bandSetlistRepository),
        },
        {
          provide: BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE,
          inject: [
            BandSetlistSongRepository,
            BandSetlistRepository,
            BandSongRepository,
          ],
          useFactory: (
            bandSetlistSongRepository: BandSetlistSongRepository,
            bandSetlistRepository: BandSetlistRepository,
            bandSongRepository: BandSongRepository,
          ) =>
            new AddSongToSetlistUseCase(
              bandSetlistSongRepository,
              bandSetlistRepository,
              bandSongRepository,
            ),
        },
        {
          provide: BandFactoryModule.LIST_SETLIST_SONGS_USE_CASE,
          inject: [
            BandSetlistSongRepository,
            BandSetlistRepository,
            BandSongRepository,
          ],
          useFactory: (
            bandSetlistSongRepository: BandSetlistSongRepository,
            bandSetlistRepository: BandSetlistRepository,
            bandSongRepository: BandSongRepository,
          ) =>
            new ListSetlistSongsUseCase(
              bandSetlistSongRepository,
              bandSetlistRepository,
              bandSongRepository,
            ),
        },
        {
          provide: BandFactoryModule.CREATE_BAND_SONG_USE_CASE,
          inject: [BandSongRepository],
          useFactory: (bandSongRepository: BandSongRepository) =>
            new CreateBandSongUseCase(bandSongRepository),
        },
        {
          provide: BandFactoryModule.LIST_BAND_SONGS_USE_CASE,
          inject: [BandSongRepository],
          useFactory: (bandSongRepository: BandSongRepository) =>
            new ListBandSongsUseCase(bandSongRepository),
        },
        {
          provide: BandFactoryModule.CREATE_BAND_BOOKING_USE_CASE,
          inject: [BandBookingRepository, ContactRepository],
          useFactory: (
            bandBookingRepository: BandBookingRepository,
            contactRepository: ContactRepository,
          ) =>
            new CreateBandBookingUseCase(
              bandBookingRepository,
              contactRepository,
            ),
        },
        {
          provide: BandFactoryModule.LIST_BAND_BOOKINGS_USE_CASE,
          inject: [BandBookingRepository, ContactRepository],
          useFactory: (
            bandBookingRepository: BandBookingRepository,
            contactRepository: ContactRepository,
          ) =>
            new ListBandBookingsUseCase(
              bandBookingRepository,
              contactRepository,
            ),
        },
      ],
      exports: [
        BandFactoryModule.CREATE_BAND_USE_CASE,
        BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
        BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
        BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
        BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE,
        BandFactoryModule.LIST_SETLIST_SONGS_USE_CASE,
        BandFactoryModule.CREATE_BAND_SONG_USE_CASE,
        BandFactoryModule.LIST_BAND_SONGS_USE_CASE,
        BandFactoryModule.CREATE_BAND_BOOKING_USE_CASE,
        BandFactoryModule.LIST_BAND_BOOKINGS_USE_CASE,
      ],
    };
  }
}
