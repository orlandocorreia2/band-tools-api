import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandSongUseCase } from '@usecase/band-song/create-band-song.usecase';
import { ListBandSongsUseCase } from '@usecase/band-song/list-band-songs.usecase';
import { BandSongRepository } from '@infrastructure/repository/band-song/band-song.repository';
import { BandSongTypeormEntity } from '@infrastructure/entities/band-song/band-song-typeorm.entity';

@Module({})
export class BandSongFactoryModule {
  static readonly CREATE_BAND_SONG_USE_CASE = 'CreateBandSongUseCase';
  static readonly LIST_BAND_SONGS_USE_CASE = 'ListBandSongsUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandSongFactoryModule,
      imports: [TypeOrmModule.forFeature([BandSongTypeormEntity])],
      providers: [
        BandSongRepository,
        {
          provide: BandSongFactoryModule.CREATE_BAND_SONG_USE_CASE,
          inject: [BandSongRepository],
          useFactory: (bandSongRepository: BandSongRepository) =>
            new CreateBandSongUseCase(bandSongRepository),
        },
        {
          provide: BandSongFactoryModule.LIST_BAND_SONGS_USE_CASE,
          inject: [BandSongRepository],
          useFactory: (bandSongRepository: BandSongRepository) =>
            new ListBandSongsUseCase(bandSongRepository),
        },
      ],
      exports: [
        BandSongFactoryModule.CREATE_BAND_SONG_USE_CASE,
        BandSongFactoryModule.LIST_BAND_SONGS_USE_CASE,
      ],
    };
  }
}
