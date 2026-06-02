const MockDataSource = jest.fn();

describe('data-source', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('typeorm', () => ({ DataSource: MockDataSource }));
    jest.doMock('dotenv/config', () => ({}));
    MockDataSource.mockClear();
  });

  it('should create DataSource with values from environment variables', () => {
    require('@infrastructure/typeorm/data-source');

    expect(MockDataSource).toHaveBeenCalledWith(
      expect.objectContaining({
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        entities: expect.any(Array),
        migrations: expect.any(Array),
      }),
    );
  });

  it('should fall back to DbTypeEnum.Postgres when DB_TYPE is not set', () => {
    const saved = process.env.DB_TYPE;
    delete process.env.DB_TYPE;

    require('@infrastructure/typeorm/data-source');

    expect(MockDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'postgres' }),
    );

    process.env.DB_TYPE = saved;
  });

  it('should fall back to "localhost" when DB_HOST is not set', () => {
    const saved = process.env.DB_HOST;
    delete process.env.DB_HOST;

    require('@infrastructure/typeorm/data-source');

    expect(MockDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'localhost' }),
    );

    process.env.DB_HOST = saved;
  });

  it('should fall back to port 5432 when DB_PORT is not set', () => {
    const saved = process.env.DB_PORT;
    delete process.env.DB_PORT;

    require('@infrastructure/typeorm/data-source');

    expect(MockDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5432 }),
    );

    process.env.DB_PORT = saved;
  });
});
