import { DbTypeEnum } from '@shared/commons/enums';

let forRootAsyncConfig: any;

describe('DatabaseModule', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    jest.doMock('@nestjs/typeorm', () => ({
      TypeOrmModule: {
        forRootAsync: jest.fn().mockImplementation((config) => {
          forRootAsyncConfig = config;
          return {};
        }),
      },
    }));

    jest.doMock('@shared/config/env-config.module', () => ({
      EnvConfigModule: class EnvConfigModule {},
    }));

    jest.doMock('@shared/config/env-config.service', () => ({
      EnvConfigService: class EnvConfigService {},
    }));
  });

  it('should be defined', () => {
    const { DatabaseModule } = require('@infrastructure/database/database.module');

    expect(DatabaseModule).toBeDefined();
  });

  it('should call TypeOrmModule.forRootAsync injecting EnvConfigModule and EnvConfigService', () => {
    const { EnvConfigModule } = require('@shared/config/env-config.module');
    const { EnvConfigService } = require('@shared/config/env-config.service');

    require('@infrastructure/database/database.module');

    expect(forRootAsyncConfig.imports).toContain(EnvConfigModule);
    expect(forRootAsyncConfig.inject).toContain(EnvConfigService);
  });

  it('useFactory should return correct TypeORM options from EnvConfigService', () => {
    require('@infrastructure/database/database.module');

    const mockEnv = {
      dbType: DbTypeEnum.Postgres,
      dbHost: process.env.DB_HOST,
      dbPort: Number(process.env.DB_PORT),
      dbUser: process.env.DB_USER,
      dbPassword: process.env.DB_PASSWORD,
      dbName: process.env.DB_NAME,
      dbSynchronize: false,
      dbAutoLoadEntities: true,
    };

    const result = forRootAsyncConfig.useFactory(mockEnv);

    expect(result).toEqual({
      type: DbTypeEnum.Postgres,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [expect.stringContaining('**/*.entity{.ts,.js}')],
      synchronize: false,
      autoLoadEntities: true,
    });
  });
});
