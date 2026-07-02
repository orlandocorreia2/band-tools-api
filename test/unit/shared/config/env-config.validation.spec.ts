import {
  EnvironmentVariables,
  validate,
} from '@shared/config/env-config.validation';

jest.mock('@package.json', () => ({
  name: 'test-api',
}));

describe('env-config.validation', () => {
  const validConfig = () => ({
    ...process.env,
    PORT: Number(process.env.PORT),
    DB_PORT: Number(process.env.DB_PORT),
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
    DB_AUTO_LOAD_ENTITIES: process.env.DB_AUTO_LOAD_ENTITIES === 'true',
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
  });

  afterEach(() => {
    delete process.env.SERVICE_NAME;
  });

  describe('EnvironmentVariables', () => {
    it('should be instantiable', () => {
      expect(new EnvironmentVariables()).toBeInstanceOf(EnvironmentVariables);
    });
  });

  describe('validate', () => {
    it('should return EnvironmentVariables instance for a valid config', () => {
      const result = validate(validConfig());

      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.STAGE).toBe(process.env.STAGE);
      expect(result.PORT).toBe(Number(process.env.PORT));
      expect(result.SERVICE_NAME).toBe('test-api');
    });

    it('should set process.env SERVICE_NAME and SERVICE_VERSION from package.json', () => {
      validate(validConfig());

      expect(process.env.SERVICE_NAME).toBe('test-api');
    });

    it('should throw when config has validation errors', () => {
      expect(() => validate({ ...validConfig(), STAGE: 'invalid_stage' })).toThrow();
    });

    it('should parse raw string "false" as boolean false for DB_SYNCHRONIZE', () => {
      const result = validate({
        ...validConfig(),
        DB_SYNCHRONIZE: 'false',
        DB_AUTO_LOAD_ENTITIES: 'false',
      });

      expect(result.DB_SYNCHRONIZE).toBe(false);
      expect(result.DB_AUTO_LOAD_ENTITIES).toBe(false);
    });

    it('should parse raw string "true" as boolean true for DB_SYNCHRONIZE', () => {
      const result = validate({
        ...validConfig(),
        DB_SYNCHRONIZE: 'true',
        DB_AUTO_LOAD_ENTITIES: 'true',
      });

      expect(result.DB_SYNCHRONIZE).toBe(true);
      expect(result.DB_AUTO_LOAD_ENTITIES).toBe(true);
    });
  });
});
