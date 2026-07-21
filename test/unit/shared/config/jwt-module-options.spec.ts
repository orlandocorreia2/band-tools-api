import { jwtModuleAsyncOptions } from '@shared/config/jwt-module-options';
import { EnvConfigService } from '@shared/config/env-config.service';

describe('jwtModuleAsyncOptions', () => {
  it('should build JWT options from EnvConfigService', () => {
    const mockEnvConfigService: Pick<
      EnvConfigService,
      'jwtSecret' | 'jwtExpiresIn'
    > = { jwtSecret: 'super-secret', jwtExpiresIn: 3600 };

    const useFactory = jwtModuleAsyncOptions.useFactory as (
      envConfigService: Pick<EnvConfigService, 'jwtSecret' | 'jwtExpiresIn'>,
    ) => { secret: string; signOptions: { expiresIn: number } };

    const result = useFactory(mockEnvConfigService);

    expect(result).toEqual({
      secret: 'super-secret',
      signOptions: { expiresIn: 3600 },
    });
  });
});
