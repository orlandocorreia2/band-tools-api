import { DynamicModule, Module } from '@nestjs/common';
import { HealthCheckUseCase } from '@usecase/health-check/health-check.usecase';

@Module({})
export class HealthCheckFactoryModule {
  static readonly HEALTH_CHECK_USE_CASE = 'HealthCheckUseCase';

  static forRoot(): DynamicModule {
    return {
      module: HealthCheckFactoryModule,
      imports: [],
      providers: [
        {
          provide: HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE,
          inject: [],
          useFactory: () => new HealthCheckUseCase(),
        },
      ],
      exports: [HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE],
    };
  }
}
