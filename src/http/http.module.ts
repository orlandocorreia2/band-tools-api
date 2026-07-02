import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check/health-check.controller';
import { HealthCheckFactoryModule } from './health-check/health-check-factory.module';
import { BandController } from './band/band.controller';
import { BandFactoryModule } from './band/band-factory.module';
import { UserController } from './user/user.controller';
import { UserFactoryModule } from './user/user-factory.module';

@Module({
  imports: [
    HealthCheckFactoryModule.forRoot(),
    BandFactoryModule.forRoot(),
    UserFactoryModule.forRoot(),
  ],
  controllers: [HealthCheckController, BandController, UserController],
})
export class HttpModule {}
