import { EnvConfigService } from '@shared/config/env-config.service';
import { DbTypeEnum } from '@shared/commons/enums';

describe('EnvConfigService', () => {
  const mockConfigService = { get: jest.fn() };
  let service: EnvConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnvConfigService(mockConfigService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('port', () => {
    it('should delegate to configService.get with PORT key', () => {
      mockConfigService.get.mockReturnValue(Number(process.env.PORT));

      expect(service.port).toBe(Number(process.env.PORT));
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
    });
  });

  describe('dbHost', () => {
    it('should delegate to configService.get with DB_HOST key', () => {
      mockConfigService.get.mockReturnValue(process.env.DB_HOST);

      expect(service.dbHost).toBe(process.env.DB_HOST);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_HOST');
    });
  });

  describe('dbPort', () => {
    it('should delegate to configService.get with DB_PORT key', () => {
      mockConfigService.get.mockReturnValue(Number(process.env.DB_PORT));

      expect(service.dbPort).toBe(Number(process.env.DB_PORT));
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_PORT');
    });
  });

  describe('dbUser', () => {
    it('should delegate to configService.get with DB_USER key', () => {
      mockConfigService.get.mockReturnValue(process.env.DB_USER);

      expect(service.dbUser).toBe(process.env.DB_USER);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_USER');
    });
  });

  describe('dbPassword', () => {
    it('should delegate to configService.get with DB_PASSWORD key', () => {
      mockConfigService.get.mockReturnValue(process.env.DB_PASSWORD);

      expect(service.dbPassword).toBe(process.env.DB_PASSWORD);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_PASSWORD');
    });
  });

  describe('dbName', () => {
    it('should delegate to configService.get with DB_NAME key', () => {
      mockConfigService.get.mockReturnValue(process.env.DB_NAME);

      expect(service.dbName).toBe(process.env.DB_NAME);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_NAME');
    });
  });

  describe('dbType', () => {
    it('should delegate to configService.get with DB_TYPE key', () => {
      mockConfigService.get.mockReturnValue(DbTypeEnum.Postgres);

      expect(service.dbType).toBe(DbTypeEnum.Postgres);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_TYPE');
    });
  });

  describe('dbSynchronize', () => {
    it('should delegate to configService.get with DB_SYNCHRONIZE key', () => {
      mockConfigService.get.mockReturnValue(false);

      expect(service.dbSynchronize).toBe(false);
      expect(mockConfigService.get).toHaveBeenCalledWith('DB_SYNCHRONIZE');
    });
  });

  describe('dbAutoLoadEntities', () => {
    it('should delegate to configService.get with DB_AUTO_LOAD_ENTITIES key', () => {
      mockConfigService.get.mockReturnValue(true);

      expect(service.dbAutoLoadEntities).toBe(true);
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'DB_AUTO_LOAD_ENTITIES',
      );
    });
  });

  describe('bcryptSaltRounds', () => {
    it('should delegate to configService.get with BCRYPT_SALT_ROUNDS key', () => {
      mockConfigService.get.mockReturnValue(10);

      expect(service.bcryptSaltRounds).toBe(10);
      expect(mockConfigService.get).toHaveBeenCalledWith('BCRYPT_SALT_ROUNDS');
    });
  });

  describe('jwtSecret', () => {
    it('should delegate to configService.get with JWT_SECRET key', () => {
      mockConfigService.get.mockReturnValue('super-secret');

      expect(service.jwtSecret).toBe('super-secret');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('jwtExpiresIn', () => {
    it('should delegate to configService.get with JWT_EXPIRES_IN key', () => {
      mockConfigService.get.mockReturnValue(3600);

      expect(service.jwtExpiresIn).toBe(3600);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN');
    });
  });
});
