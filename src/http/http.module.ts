import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HealthCheckController } from './health-check/health-check.controller';
import { HealthCheckFactoryModule } from './health-check/health-check-factory.module';
import { BandController } from './band/band.controller';
import { BandFactoryModule } from './band/band-factory.module';
import { UserController } from './user/user.controller';
import { UserFactoryModule } from './user/user-factory.module';
import { AuthController } from './auth/auth.controller';
import { AuthFactoryModule } from './auth/auth-factory.module';
import { JwtAuthGuard } from './middlewares/jwt-auth.guard';
import { jwtModuleAsyncOptions } from '@shared/config/jwt-module-options';

@Module({
  imports: [
    HealthCheckFactoryModule.forRoot(),
    BandFactoryModule.forRoot(),
    UserFactoryModule.forRoot(),
    AuthFactoryModule.forRoot(),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
  ],
  controllers: [
    HealthCheckController,
    BandController,
    UserController,
    AuthController,
  ],
  providers: [JwtAuthGuard],
})
export class HttpModule {}
