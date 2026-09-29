import { DataSource } from 'typeorm';
import { WORKER_DATABASE_PREFIX } from './test-database.constants';

const assertIsTestDatabase = (database: string) => {
  if (database.startsWith(WORKER_DATABASE_PREFIX)) return;

  throw new Error(
    `Refusing to truncate "${database}": only databases prefixed with "${WORKER_DATABASE_PREFIX}" can be cleaned.`,
  );
};

export const truncateAllTables = async (
  dataSource: DataSource,
): Promise<void> => {
  const { database } = dataSource.options as { database?: string };
  assertIsTestDatabase(database ?? '');

  const tables = dataSource.entityMetadatas
    .map(({ tableName }) => `"${tableName}"`)
    .join(', ');

  await dataSource.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
};
