import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandSetlistUseCase } from '@usecase/band-setlist/create-band-setlist.usecase';
import { ListBandSetlistsUseCase } from '@usecase/band-setlist/list-band-setlists.usecase';
import { BandSetlistRepository } from '@infrastructure/repository/band-setlist/band-setlist.repository';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity';

@Module({})
export class BandSetlistFactoryModule {
  static readonly CREATE_BAND_SETLIST_USE_CASE = 'CreateBandSetlistUseCase';
  static readonly LIST_BAND_SETLISTS_USE_CASE = 'ListBandSetlistsUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandSetlistFactoryModule,
      imports: [TypeOrmModule.forFeature([BandSetlistTypeormEntity])],
      providers: [
        BandSetlistRepository,
        {
          provide: BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
          inject: [BandSetlistRepository],
          useFactory: (bandSetlistRepository: BandSetlistRepository) =>
            new CreateBandSetlistUseCase(bandSetlistRepository),
        },
        {
          provide: BandSetlistFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
          inject: [BandSetlistRepository],
          useFactory: (bandSetlistRepository: BandSetlistRepository) =>
            new ListBandSetlistsUseCase(bandSetlistRepository),
        },
      ],
      exports: [
        BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
        BandSetlistFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
      ],
    };
  }
}
