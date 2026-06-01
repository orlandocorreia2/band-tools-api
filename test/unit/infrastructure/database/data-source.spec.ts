import { DbTypeEnum } from '@shared/commons/enums';

const mockDataSourceConstructor = jest.fn().mockImplementation(() => ({}));

jest.mock('dotenv/config', () => ({}));
jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation((opts) => mockDataSourceConstructor(opts)),
}));

describe('data-source', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    jest.doMock('dotenv/config', () => ({}));
    jest.doMock('typeorm', () => ({
      DataSource: jest.fn().mockImplementation((opts) => mockDataSourceConstructor(opts)),
    }));
  });

  afterEach(() => {
    process.env.DB_TYPE = 'postgres';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
  });

  it('should create DataSource with values from process.env', () => {
    require('@infrastructure/database/data-source');

    expect(mockDataSourceConstructor).toHaveBeenCalledWith({
      type: DbTypeEnum.Postgres,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [expect.stringContaining('**/*.entity{.ts,.js}')],
      migrations: [expect.stringContaining('migrations/**/*{.ts,.js}')],
      synchronize: false,
    });
  });

  it('should export a DataSource instance as default', () => {
    const module = require('@infrastructure/database/data-source');

    expect(module.default).toBeDefined();
  });

  it('should default type to DbTypeEnum.Postgres when DB_TYPE is undefined', () => {
    delete process.env.DB_TYPE;

    require('@infrastructure/database/data-source');

    expect(mockDataSourceConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ type: DbTypeEnum.Postgres }),
    );
  });

  it('should default host to localhost when DB_HOST is undefined', () => {
    delete process.env.DB_HOST;

    require('@infrastructure/database/data-source');

    expect(mockDataSourceConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'localhost' }),
    );
  });

  it('should default port to 5432 when DB_PORT is undefined', () => {
    delete process.env.DB_PORT;

    require('@infrastructure/database/data-source');

    expect(mockDataSourceConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5432 }),
    );
  });
});
