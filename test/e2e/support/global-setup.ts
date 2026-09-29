import './assert-supported-node';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { DataSource } from 'typeorm';
import {
  POSTGRES_IMAGE,
  TEMPLATE_DATABASE,
  workerDatabaseName,
} from './test-database.constants';

type JestGlobalConfig = { maxWorkers: number };

const MIGRATIONS_GLOB = join(
  __dirname,
  '../../../src/infrastructure/typeorm/migrations/**/*{.ts,.js}',
);

const startContainer = async (): Promise<StartedPostgreSqlContainer> => {
  try {
    return await new PostgreSqlContainer(POSTGRES_IMAGE)
      .withDatabase(TEMPLATE_DATABASE)
      .withUsername('band_tools_test')
      .withPassword(randomBytes(24).toString('hex'))
      .start();
  } catch (error) {
    throw new Error(
      'e2e tests require Docker running (Docker Desktop with WSL integration or Docker Engine in WSL). ' +
        `Could not start the PostgreSQL container: ${(error as Error).message}`,
    );
  }
};

const exportConnectionEnvironment = (container: StartedPostgreSqlContainer) => {
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getPort());
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
  process.env.DB_NAME = TEMPLATE_DATABASE;
};

const connect = (database: string, migrations: string[] = []) =>
  new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
    migrations,
    synchronize: false,
  }).initialize();

const migrateTemplateDatabase = async () => {
  const dataSource = await connect(TEMPLATE_DATABASE, [MIGRATIONS_GLOB]);
  await dataSource.runMigrations();
  await dataSource.destroy();
};

const createWorkerDatabases = async (workers: number) => {
  const dataSource = await connect('postgres');
  for (let worker = 1; worker <= workers; worker++) {
    await dataSource.query(
      `CREATE DATABASE "${workerDatabaseName(worker)}" TEMPLATE "${TEMPLATE_DATABASE}"`,
    );
  }
  await dataSource.destroy();
};

export default async (globalConfig: JestGlobalConfig) => {
  const container = await startContainer();
  exportConnectionEnvironment(container);

  await migrateTemplateDatabase();
  await createWorkerDatabases(globalConfig.maxWorkers);

  (
    globalThis as { __POSTGRES_CONTAINER__?: StartedPostgreSqlContainer }
  ).__POSTGRES_CONTAINER__ = container;
};
