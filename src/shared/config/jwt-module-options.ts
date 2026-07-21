import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { EnvConfigModule } from './env-config.module';
import { EnvConfigService } from './env-config.service';

export const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  imports: [EnvConfigModule],
  inject: [EnvConfigService],
  useFactory: (envConfigService: EnvConfigService) => ({
    secret: envConfigService.jwtSecret,
    signOptions: { expiresIn: envConfigService.jwtExpiresIn },
  }),
};
