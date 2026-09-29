import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HealthCheckController } from './health-check/health-check.controller';
import { HealthCheckFactoryModule } from './health-check/health-check-factory.module';
import { BandController } from './band/band.controller';
import { BandFactoryModule } from './band/band-factory.module';
import { BandSongController } from './band/band-song.controller';
import { BandSetlistController } from './band/band-setlist.controller';
import { BandSetlistSongController } from './band/band-setlist-song.controller';
import { BandBookingController } from './band/band-booking.controller';
import { UserController } from './user/user.controller';
import { UserFactoryModule } from './user/user-factory.module';
import { ContactController } from './contact/contact.controller';
import { ContactFactoryModule } from './contact/contact-factory.module';
import { AuthController } from './auth/auth.controller';
import { AuthFactoryModule } from './auth/auth-factory.module';
import { JwtAuthGuard } from './middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from './middlewares/auth-user-is-member-band.guard';
import { jwtModuleAsyncOptions } from '@shared/config/jwt-module-options';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';

@Module({
  imports: [
    HealthCheckFactoryModule.forRoot(),
    BandFactoryModule.forRoot(),
    UserFactoryModule.forRoot(),
    ContactFactoryModule.forRoot(),
    AuthFactoryModule.forRoot(),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    PersistenceModule,
  ],
  controllers: [
    HealthCheckController,
    BandController,
    BandSongController,
    BandSetlistController,
    BandSetlistSongController,
    BandBookingController,
    UserController,
    ContactController,
    AuthController,
  ],
  providers: [JwtAuthGuard, AuthUserIsMemberBandGuard],
})
export class HttpModule {}
