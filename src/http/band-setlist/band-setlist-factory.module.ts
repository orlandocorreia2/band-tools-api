import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandSetlistUseCase } from '@usecase/band-setlist/create-band-setlist.usecase';
import { BandSetlistRepository } from '@infrastructure/repository/band-setlist/band-setlist.repository';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity';

@Module({})
export class BandSetlistFactoryModule {
  static readonly CREATE_BAND_SETLIST_USE_CASE = 'CreateBandSetlistUseCase';

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
      ],
      exports: [BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE],
    };
  }
}
