import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { EmptyInfrastructureModule } from './empty-infrastructure.module';
import { InMemoryPersistenceModule } from './in-memory-persistence.module';
import { InMemoryStore } from './in-memory-store';

export type ComponentApp = {
  app: INestApplication;
  store: InMemoryStore;
};

export const createComponentApp = async (): Promise<ComponentApp> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(InfrastructureModule)
    .useModule(EmptyInfrastructureModule)
    .overrideModule(PersistenceModule)
    .useModule(InMemoryPersistenceModule)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new ExceptionFilterMiddleware());
  await app.init();

  return { app, store: app.get(InMemoryStore) };
};
