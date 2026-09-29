import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async () => {
  const container = (
    globalThis as { __POSTGRES_CONTAINER__?: StartedPostgreSqlContainer }
  ).__POSTGRES_CONTAINER__;

  await container?.stop();
};
