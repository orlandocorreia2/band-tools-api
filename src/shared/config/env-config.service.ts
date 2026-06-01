import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbTypeEnum } from '@shared/commons/enums';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port() {
    return this.configService.get<number>('PORT');
  }

  get dbHost() {
    return this.configService.get<string>('DB_HOST');
  }

  get dbPort() {
    return this.configService.get<number>('DB_PORT');
  }

  get dbUser() {
    return this.configService.get<string>('DB_USER');
  }

  get dbPassword() {
    return this.configService.get<string>('DB_PASSWORD');
  }

  get dbName() {
    return this.configService.get<string>('DB_NAME');
  }

  get dbType() {
    return this.configService.get<DbTypeEnum>('DB_TYPE');
  }

  get dbSynchronize() {
    return this.configService.get<boolean>('DB_SYNCHRONIZE');
  }

  get dbAutoLoadEntities() {
    return this.configService.get<boolean>('DB_AUTO_LOAD_ENTITIES');
  }
}
