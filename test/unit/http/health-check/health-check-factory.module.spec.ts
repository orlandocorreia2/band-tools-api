import { HealthCheckFactoryModule } from '@http/health-check/health-check-factory.module';
import { HealthCheckUseCase } from '@usecase/health-check/health-check.usecase';

describe('HealthCheckFactoryModule', () => {
  describe('static tokens', () => {
    it('should expose HEALTH_CHECK_USE_CASE token', () => {
      expect(HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE).toBe(
        'HealthCheckUseCase',
      );
    });
  });

  describe('forRoot', () => {
    it('should return a DynamicModule with HealthCheckFactoryModule as root', () => {
      const result = HealthCheckFactoryModule.forRoot();

      expect(result.module).toBe(HealthCheckFactoryModule);
      expect(result.imports).toEqual([]);
      expect(result.exports).toContain(
        HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE,
      );
    });

    it('should register HealthCheckUseCase provider with correct token', () => {
      const result = HealthCheckFactoryModule.forRoot();
      const provider = result.providers[0] as any;

      expect(provider.provide).toBe(
        HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE,
      );
      expect(provider.inject).toEqual([]);
    });

    it('should create a HealthCheckUseCase instance via useFactory', () => {
      const result = HealthCheckFactoryModule.forRoot();
      const provider = result.providers[0] as any;

      const instance = provider.useFactory();

      expect(instance).toBeInstanceOf(HealthCheckUseCase);
    });
  });
});
