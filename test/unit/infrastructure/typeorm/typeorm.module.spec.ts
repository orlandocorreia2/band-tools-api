const mockForRootAsync = jest.fn().mockReturnValue({});

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: { forRootAsync: mockForRootAsync },
}));

jest.mock('@shared/config/env-config.module', () => ({
  EnvConfigModule: class EnvConfigModule {},
}));

jest.mock('@shared/config/env-config.service', () => ({
  EnvConfigService: class EnvConfigService {},
}));

import { TypeormModule } from '@infrastructure/typeorm/typeorm.module';
import { EnvConfigService } from '@shared/config/env-config.service';

describe('TypeormModule', () => {
  it('should be defined', () => {
    expect(TypeormModule).toBeDefined();
  });

  it('should call TypeOrmModule.forRootAsync once', () => {
    expect(mockForRootAsync).toHaveBeenCalledTimes(1);
  });

  it('should inject EnvConfigService in the factory provider', () => {
    const [options] = mockForRootAsync.mock.calls[0];
    expect(options.inject).toContain(EnvConfigService);
  });

  it('should build TypeORM config from EnvConfigService via useFactory', () => {
    const [options] = mockForRootAsync.mock.calls[0];
    const mockEnv: Partial<EnvConfigService> = {
      dbType: 'postgres' as any,
      dbHost: 'localhost',
      dbPort: 5432,
      dbUser: 'user',
      dbPassword: 'pass',
      dbName: 'db',
      dbSynchronize: false,
      dbAutoLoadEntities: true,
    };

    const config = options.useFactory(mockEnv);

    expect(config).toEqual(
      expect.objectContaining({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'pass',
        database: 'db',
        synchronize: false,
        autoLoadEntities: true,
        entities: expect.any(Array),
      }),
    );
  });
});
