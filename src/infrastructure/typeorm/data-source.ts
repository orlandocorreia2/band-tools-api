import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DbTypeEnum } from '../../shared/commons/enums';

export default new DataSource({
  type: (process.env.DB_TYPE as DbTypeEnum) ?? DbTypeEnum.Postgres,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  synchronize: false,
});
