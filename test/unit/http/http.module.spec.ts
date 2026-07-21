jest.mock('../../../src/http/health-check/health-check-factory.module', () => ({
  HealthCheckFactoryModule: {
    forRoot: jest
      .fn()
      .mockReturnValue({ module: class HealthCheckFactoryModule {} }),
    HEALTH_CHECK_USE_CASE: 'HealthCheckUseCase',
  },
}));

jest.mock('../../../src/http/health-check/health-check.controller', () => ({
  HealthCheckController: class HealthCheckController {},
}));

import { HealthCheckFactoryModule } from '@http/health-check/health-check-factory.module';
import { HttpModule } from '@http/http.module';

describe('HttpModule', () => {
  it('should be defined', () => {
    expect(HttpModule).toBeDefined();
  });

  it('should be instantiable', () => {
    expect(new HttpModule()).toBeInstanceOf(HttpModule);
  });

  it('should call HealthCheckFactoryModule.forRoot', () => {
    expect(HealthCheckFactoryModule.forRoot).toHaveBeenCalled();
  });
});
