import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvConfigModule } from '@shared/config/env-config.module';
import { EnvConfigService } from '@shared/config/env-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        type: env.dbType,
        host: env.dbHost,
        port: env.dbPort,
        username: env.dbUser,
        password: env.dbPassword,
        database: env.dbName,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: env.dbSynchronize,
        autoLoadEntities: env.dbAutoLoadEntities,
      }),
    }),
  ],
})
export class DatabaseModule {}
