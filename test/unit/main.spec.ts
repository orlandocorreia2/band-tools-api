const mockNestFactoryCreate = jest.fn();
const mockListenFn = jest.fn();
const mockUseFn = jest.fn();
const mockGetFn = jest.fn();
const mockEnableCors = jest.fn();
const mockUseGlobalFilters = jest.fn();
const mockUseGlobalPipes = jest.fn();
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
  useGlobalPipes: mockUseGlobalPipes,
};

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

let capturedPipeOptions: { exceptionFactory?: (errors: any[]) => any } = {};

describe('main', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    capturedPipeOptions = {};

    mockNestFactoryCreate.mockResolvedValue(mockApp);
    mockListenFn.mockResolvedValue(undefined);
    mockGetFn.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });
    mockApiReferenceFn.mockReturnValue(mockApiMiddleware);
    mockBuildDocFn.mockReturnValue({});

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: mockNestFactoryCreate },
    }));
    jest.doMock('@nestjs/common', () => ({
      HttpStatus: { UNPROCESSABLE_ENTITY: 422 },
      ValidationPipe: jest.fn().mockImplementation((options) => {
        capturedPipeOptions = options;
        return {};
      }),
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
    jest.doMock('@shared/commons/enums/exception.enum', () => ({
      ExceptionTypeEnum: { ClassValidator: 'Validation errors' },
    }));
    jest.doMock('@shared/exceptions/base.exception', () => ({
      BaseException: jest.fn().mockImplementation((opts) => opts),
    }));
    jest.doMock('../../src/app.module', () => ({
      AppModule: class AppModule {},
    }));
  });

  const originalNodeEnv = process.env.NODE_ENV;
  const originalPort = process.env.PORT;

  const restoreEnvVar = (key: string, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }
    process.env[key] = value;
  };

  afterEach(() => {
    restoreEnvVar('NODE_ENV', originalNodeEnv);
    restoreEnvVar('PORT', originalPort);
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

  it('should register ValidationPipe as global pipe', async () => {
    require('../../src/main');
    await flush();

    expect(mockUseGlobalPipes).toHaveBeenCalledWith(expect.any(Object));
  });

  describe('ValidationPipe exceptionFactory', () => {
    it('should map validation errors to BaseException with correct shape', async () => {
      require('../../src/main');
      await flush();

      const MockBaseException =
        jest.requireMock('@shared/exceptions/base.exception').BaseException;

      const validationErrors = [
        {
          property: 'name',
          constraints: {
            isString: 'name must be a string',
            minLength: 'name must be at least 3 characters',
          },
        },
      ];

      capturedPipeOptions.exceptionFactory(validationErrors);

      expect(MockBaseException).toHaveBeenCalledWith({
        code: 422,
        title: 'Validation errors',
        detail: 'Validation failed',
        errors: [
          {
            field: 'name',
            detail: 'name must be a string, name must be at least 3 characters',
          },
        ],
      });
    });

    it('should use empty string for detail when constraints are undefined', async () => {
      require('../../src/main');
      await flush();

      const MockBaseException =
        jest.requireMock('@shared/exceptions/base.exception').BaseException;

      const validationErrors = [{ property: 'genre', constraints: undefined }];

      capturedPipeOptions.exceptionFactory(validationErrors);

      expect(MockBaseException).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [{ field: 'genre', detail: '' }],
        }),
      );
    });
  });
});
