import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';

@Module({})
export class BandFactoryModule {
  static readonly CREATE_BAND_USE_CASE = 'CreateBandUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandFactoryModule,
      imports: [TypeOrmModule.forFeature([BandTypeormEntity])],
      providers: [
        BandRepository,
        {
          provide: BandFactoryModule.CREATE_BAND_USE_CASE,
          inject: [BandRepository],
          useFactory: (bandRepository: BandRepository) =>
            new CreateBandUseCase(bandRepository),
        },
      ],
      exports: [BandFactoryModule.CREATE_BAND_USE_CASE],
    };
  }
}
