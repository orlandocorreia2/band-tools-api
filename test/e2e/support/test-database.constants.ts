export const POSTGRES_IMAGE = 'postgres:16-alpine';

export const TEMPLATE_DATABASE = 'band_tools_template';

export const WORKER_DATABASE_PREFIX = 'band_tools_test_';

export const workerDatabaseName = (worker: number | string) =>
  `${WORKER_DATABASE_PREFIX}${worker}`;
