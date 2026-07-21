import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';

@Module({})
export class BandFactoryModule {
  static readonly CREATE_BAND_USE_CASE = 'CreateBandUseCase';

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
      ],
      exports: [BandFactoryModule.CREATE_BAND_USE_CASE],
    };
  }
}
