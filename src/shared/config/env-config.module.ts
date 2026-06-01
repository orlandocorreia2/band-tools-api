import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { validate } from './env-config.validation';
import { EnvConfigService } from './env-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      envFilePath: ['.env'],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, EnvConfigService],
  exports: [ConfigService, EnvConfigService],
})
export class EnvConfigModule {
  onModuleInit() {
    console.log(`The EnvConfigModule has been initialized.`);
  }
}
