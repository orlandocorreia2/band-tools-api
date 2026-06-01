import { EnvConfigModule } from '@shared/config/env-config.module';

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({ module: class ConfigModule {} }),
  },
  ConfigService: class ConfigService {},
}));

jest.mock('../../../../src/shared/config/env-config.service', () => ({
  EnvConfigService: class EnvConfigService {},
}));

jest.mock('../../../../src/shared/config/env-config.validation', () => ({
  validate: jest.fn(),
}));

describe('EnvConfigModule', () => {
  it('should be defined', () => {
    expect(EnvConfigModule).toBeDefined();
  });

  it('should log on onModuleInit', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    new EnvConfigModule().onModuleInit();

    expect(consoleSpy).toHaveBeenCalledWith(
      'The EnvConfigModule has been initialized.',
    );
    consoleSpy.mockRestore();
  });
});
