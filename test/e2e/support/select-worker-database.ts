import { workerDatabaseName } from './test-database.constants';

process.env.DB_NAME = workerDatabaseName(process.env.JEST_WORKER_ID ?? 1);
