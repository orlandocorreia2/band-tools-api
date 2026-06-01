const mockBuild = jest.fn();
const mockBuilder = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setLicense: jest.fn().mockReturnThis(),
  setTermsOfService: jest.fn().mockReturnThis(),
  addServer: jest.fn().mockReturnThis(),
  addGlobalParameters: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  build: mockBuild,
};
const mockCreateDocument = jest.fn();

function setupModule(version: string | undefined) {
  jest.resetModules();
  jest.clearAllMocks();

  jest.doMock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => mockBuilder),
    SwaggerModule: { createDocument: mockCreateDocument },
  }));
  jest.doMock('@nestjs/platform-fastify', () => ({}));
  jest.doMock('@package.json', () => ({
    title: 'Band Tools API',
    description: 'API for managing bands',
    version,
  }));

  return require('../../../../src/shared/commons/openapi.commons').OpenapiCommons;
}

describe('OpenapiCommons', () => {
  it('should call all DocumentBuilder methods with correct values', () => {
    const mockDocument = { openapi: '3.0.0' };
    const OpenapiCommons = setupModule('2.0.0');
    mockBuild.mockReturnValue({});
    mockCreateDocument.mockReturnValue(mockDocument);
    const mockApp = {};

    const result = new OpenapiCommons(mockApp).buildDocumentation();

    expect(mockBuilder.setTitle).toHaveBeenCalledWith('Band Tools API');
    expect(mockBuilder.setDescription).toHaveBeenCalledWith('API for managing bands');
    expect(mockBuilder.setVersion).toHaveBeenCalledWith('2.0.0');
    expect(mockBuilder.setLicense).toHaveBeenCalledWith('MIT', 'https://opensource.org/licenses/MIT');
    expect(mockBuilder.setTermsOfService).toHaveBeenCalledWith('https://band-tools.com.br/terms');
    expect(mockBuilder.addServer).toHaveBeenCalledWith('http://localhost:3000');
    expect(mockBuilder.addServer).toHaveBeenCalledWith('https://band-tools.com.br/v1');
    expect(mockBuilder.addGlobalParameters).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'authorization',
        in: 'header',
        required: true,
      }),
    );
    expect(mockCreateDocument).toHaveBeenCalledWith(mockApp, {});
    expect(result).toBe(mockDocument);
  });

  it('should fall back to "1.0" when version is undefined', () => {
    const OpenapiCommons = setupModule(undefined);
    mockBuild.mockReturnValue({});
    mockCreateDocument.mockReturnValue({});

    new OpenapiCommons({}).buildDocumentation();

    expect(mockBuilder.setVersion).toHaveBeenCalledWith('1.0');
  });
});
