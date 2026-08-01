import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheckController } from './health-check/health-check.controller';
import { HealthCheckFactoryModule } from './health-check/health-check-factory.module';
import { BandController } from './band/band.controller';
import { BandFactoryModule } from './band/band-factory.module';
import { BandSongController } from './band-song/band-song.controller';
import { BandSongFactoryModule } from './band-song/band-song-factory.module';
import { UserController } from './user/user.controller';
import { UserFactoryModule } from './user/user-factory.module';
import { AuthController } from './auth/auth.controller';
import { AuthFactoryModule } from './auth/auth-factory.module';
import { JwtAuthGuard } from './middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from './middlewares/auth-user-is-member-band.guard';
import { jwtModuleAsyncOptions } from '@shared/config/jwt-module-options';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';

@Module({
  imports: [
    HealthCheckFactoryModule.forRoot(),
    BandFactoryModule.forRoot(),
    BandSongFactoryModule.forRoot(),
    UserFactoryModule.forRoot(),
    AuthFactoryModule.forRoot(),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    TypeOrmModule.forFeature([
      BandTypeormEntity,
      UserTypeormEntity,
      BandMemberTypeormEntity,
    ]),
  ],
  controllers: [
    HealthCheckController,
    BandController,
    BandSongController,
    UserController,
    AuthController,
  ],
  providers: [
    JwtAuthGuard,
    AuthUserIsMemberBandGuard,
    BandRepository,
    UserRepository,
    BandMemberRepository,
  ],
})
export class HttpModule {}
