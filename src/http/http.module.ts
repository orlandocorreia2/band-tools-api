import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check/health-check.controller';
import { HealthCheckFactoryModule } from './health-check/health-check-factory.module';

@Module({
  imports: [HealthCheckFactoryModule.forRoot()],
  controllers: [HealthCheckController],
})
export class HttpModule {}
