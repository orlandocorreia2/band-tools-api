const mockNestFactoryCreate = jest.fn();
const mockListenFn = jest.fn();
const mockUseFn = jest.fn();
const mockGetFn = jest.fn();
const mockEnableCors = jest.fn();
const mockUseGlobalFilters = jest.fn();
const mockBuildDocFn = jest.fn();
const mockApiMiddleware = jest.fn();
const mockApiReferenceFn = jest.fn();
const mockConfigModuleForRoot = jest.fn();

const mockApp = {
  get: mockGetFn,
  use: mockUseFn,
  listen: mockListenFn,
  enableCors: mockEnableCors,
  useGlobalFilters: mockUseGlobalFilters,
};

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('main', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockNestFactoryCreate.mockResolvedValue(mockApp);
    mockListenFn.mockResolvedValue(undefined);
    mockGetFn.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });
    mockApiReferenceFn.mockReturnValue(mockApiMiddleware);
    mockBuildDocFn.mockReturnValue({});

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: mockNestFactoryCreate },
    }));
    jest.doMock('@nestjs/platform-fastify', () => ({
      FastifyAdapter: jest.fn().mockImplementation(() => ({})),
    }));
    jest.doMock('@nestjs/config', () => ({
      ConfigModule: { forRoot: mockConfigModuleForRoot },
      ConfigService: class ConfigService {},
    }));
    jest.doMock('@scalar/nestjs-api-reference', () => ({
      apiReference: mockApiReferenceFn,
    }));
    jest.doMock('@shared/commons/openapi.commons', () => ({
      OpenapiCommons: jest.fn().mockImplementation(() => ({
        buildDocumentation: mockBuildDocFn,
      })),
    }));
    jest.doMock('@http/middlewares/exception-filter.middleware', () => ({
      ExceptionFilterMiddleware: jest.fn().mockImplementation(() => ({})),
    }));
    jest.doMock('../../src/app.module', () => ({
      AppModule: class AppModule {},
    }));
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
  });

  it('should create app with FastifyAdapter and bufferLogs', async () => {
    require('../../src/main');
    await flush();

    expect(mockNestFactoryCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Object),
      { bufferLogs: true },
    );
  });

  it('should listen on port 3000 by default when configService returns undefined', async () => {
    mockGetFn.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });

    require('../../src/main');
    await flush();

    expect(mockListenFn).toHaveBeenCalledWith(3000, '0.0.0.0');
  });

  it('should listen on port from configService when defined', async () => {
    mockGetFn.mockReturnValue({ get: jest.fn().mockReturnValue(4000) });

    require('../../src/main');
    await flush();

    expect(mockListenFn).toHaveBeenCalledWith(4000, '0.0.0.0');
  });

  it('should set ignoreEnvFile to true when NODE_ENV is PRODUCTION', async () => {
    process.env.NODE_ENV = 'PRODUCTION';

    require('../../src/main');
    await flush();

    expect(mockConfigModuleForRoot).toHaveBeenCalledWith(
      expect.objectContaining({ ignoreEnvFile: true }),
    );
  });

  it('should set ignoreEnvFile to false when NODE_ENV is not PRODUCTION', async () => {
    process.env.NODE_ENV = 'development';

    require('../../src/main');
    await flush();

    expect(mockConfigModuleForRoot).toHaveBeenCalledWith(
      expect.objectContaining({ ignoreEnvFile: false }),
    );
  });

  it('should build documentation and register apiReference at /openapi', async () => {
    const mockDoc = { openapi: '3.0.0' };
    mockBuildDocFn.mockReturnValue(mockDoc);

    require('../../src/main');
    await flush();

    expect(mockBuildDocFn).toHaveBeenCalled();
    expect(mockApiReferenceFn).toHaveBeenCalledWith(
      expect.objectContaining({
        withFastify: true,
        theme: 'bluePlanet',
        spec: { content: mockDoc },
      }),
    );
    expect(mockUseFn).toHaveBeenCalledWith('/openapi', mockApiMiddleware);
  });

  it('should enable CORS with correct options', async () => {
    require('../../src/main');
    await flush();

    expect(mockEnableCors).toHaveBeenCalledWith({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'authorization',
        'content-type',
        'accept',
        'cache-control',
      ],
      credentials: false,
    });
  });

  it('should register ExceptionFilterMiddleware as global filter', async () => {
    require('../../src/main');
    await flush();

    expect(mockUseGlobalFilters).toHaveBeenCalledWith(expect.any(Object));
  });
});
