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
import { MODULE_METADATA } from '@nestjs/common/constants';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { BandMemberRepository } from '@infrastructure/repository/band/band-member.repository';

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

  it('should import PersistenceModule to provide the repositories used by the guards', () => {
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      HttpModule,
    ) as unknown[];
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      HttpModule,
    ) as unknown[];

    expect(imports).toContain(PersistenceModule);
    expect(providers).not.toContain(BandRepository);
    expect(providers).not.toContain(UserRepository);
    expect(providers).not.toContain(BandMemberRepository);
  });
});
