import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { ListBandsByUserUseCase } from '@usecase/band/list-bands-by-user.usecase';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';

@Module({})
export class BandFactoryModule {
  static readonly CREATE_BAND_USE_CASE = 'CreateBandUseCase';
  static readonly LIST_BANDS_BY_USER_USE_CASE = 'ListBandsByUserUseCase';

  static forRoot(): DynamicModule {
    return {
      module: BandFactoryModule,
      imports: [
        TypeOrmModule.forFeature([
          BandTypeormEntity,
          BandMemberTypeormEntity,
          UserTypeormEntity,
        ]),
      ],
      providers: [
        BandRepository,
        BandMemberRepository,
        UserRepository,
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
      ],
      exports: [
        BandFactoryModule.CREATE_BAND_USE_CASE,
        BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
      ],
    };
  }
}
