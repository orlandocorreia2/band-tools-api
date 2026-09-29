import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { readdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../../../src/app.module';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { truncateAllTables } from './database-cleaner';

const DEVELOPMENT_DATABASE_PORT = 5432;

const migrationsDirectory = join(
  __dirname,
  '../../../src/infrastructure/typeorm/migrations',
);

const versionedMigrationFiles = () =>
  readdirSync(migrationsDirectory).filter((file) => /\.(t|j)s$/.test(file));

describe('Test infrastructure (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await truncateAllTables(app.get(getDataSourceToken()));
    await app.close();
  });

  it('should use a database dedicated to the current Jest worker', () => {
    expect(dataSource.options.database).toBe(
      `band_tools_test_${process.env.JEST_WORKER_ID}`,
    );
  });

  it('should not connect to the development database port', () => {
    const { port } = dataSource.options as { port?: number };

    expect(port).not.toBe(DEVELOPMENT_DATABASE_PORT);
  });

  it('should have applied every versioned migration', async () => {
    const appliedMigrations: { name: string }[] = await dataSource.query(
      'SELECT name FROM migrations',
    );

    expect(appliedMigrations).toHaveLength(versionedMigrationFiles().length);
  });

  describe('truncateAllTables', () => {
    it('should empty every domain table and keep the migrations table intact', async () => {
      await dataSource.getRepository(UserTypeormEntity).insert({
        id: randomUUID(),
        first_name: 'John',
        last_name: 'Lennon',
        email: `truncate.${randomUUID()}@example.com`,
        phone: '11912345678',
        password: 'not-a-real-hash',
      });

      await truncateAllTables(dataSource);

      for (const { tableName } of dataSource.entityMetadatas) {
        const [{ count }]: { count: string }[] = await dataSource.query(
          `SELECT COUNT(*) AS count FROM "${tableName}"`,
        );
        expect(Number(count)).toBe(0);
      }
      const appliedMigrations: unknown[] = await dataSource.query(
        'SELECT name FROM migrations',
      );
      expect(appliedMigrations).toHaveLength(versionedMigrationFiles().length);
    });

    it('should refuse to run against a database outside the test prefix', async () => {
      const developmentDataSource = {
        options: { database: 'band_tools_db' },
      } as unknown as DataSource;

      await expect(truncateAllTables(developmentDataSource)).rejects.toThrow(
        'band_tools_db',
      );
    });
  });
});
