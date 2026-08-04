import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { ListBandsByUserUseCase } from '@usecase/band/list-bands-by-user.usecase';
import { CreateBandSetlistUseCase } from '@usecase/band/create-band-setlist.usecase';
import { ListBandSetlistsUseCase } from '@usecase/band/list-band-setlists.usecase';
import { AddSongToSetlistUseCase } from '@usecase/band/add-song-to-setlist.usecase';
import { CreateBandSongUseCase } from '@usecase/band/create-band-song.usecase';
import { ListBandSongsUseCase } from '@usecase/band/list-band-songs.usecase';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import { BandMemberRepository } from '@infrastructure/repository/band/band-member.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band/band-setlist-typeorm.entity';
import { BandSetlistSongTypeormEntity } from '@infrastructure/entities/band/band-setlist-song-typeorm.entity';
import { BandSongTypeormEntity } from '@infrastructure/entities/band/band-song-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band/band-member-typeorm.entity';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';

@Module({})
export class BandFactoryModule {
  static readonly CREATE_BAND_USE_CASE = 'CreateBandUseCase';
  static readonly LIST_BANDS_BY_USER_USE_CASE = 'ListBandsByUserUseCase';
  static readonly CREATE_BAND_SETLIST_USE_CASE = 'CreateBandSetlistUseCase';
  static readonly LIST_BAND_SETLISTS_USE_CASE = 'ListBandSetlistsUseCase';
  static readonly ADD_SONG_TO_SETLIST_USE_CASE = 'AddSongToSetlistUseCase';
  static readonly CREATE_BAND_SONG_USE_CASE = 'CreateBandSongUseCase';
  static readonly LIST_BAND_SONGS_USE_CASE = 'ListBandSongsUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandFactoryModule,
      imports: [
        TypeOrmModule.forFeature([
          BandTypeormEntity,
          BandMemberTypeormEntity,
          UserTypeormEntity,
          BandSetlistTypeormEntity,
          BandSetlistSongTypeormEntity,
          BandSongTypeormEntity,
        ]),
      ],
      providers: [
        BandRepository,
        BandMemberRepository,
        UserRepository,
        BandSetlistRepository,
        BandSetlistSongRepository,
        BandSongRepository,
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
      ],
      exports: [
        BandFactoryModule.CREATE_BAND_USE_CASE,
        BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
        BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
        BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
        BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE,
        BandFactoryModule.CREATE_BAND_SONG_USE_CASE,
        BandFactoryModule.LIST_BAND_SONGS_USE_CASE,
      ],
    };
  }
}
