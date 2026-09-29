import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { createComponentApp } from './create-component-app';

describe('Component test infrastructure', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createComponentApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not register any TypeORM DataSource', () => {
    expect(() => app.get(getDataSourceToken())).toThrow();
  });
});
