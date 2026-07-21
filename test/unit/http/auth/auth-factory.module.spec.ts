jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@nestjs/jwt', () => ({
  JwtModule: {
    registerAsync: jest
      .fn()
      .mockReturnValue({ module: class JwtFeatureModule {} }),
  },
  JwtService: class JwtService {},
}));

jest.mock('@usecase/auth/login.usecase', () => ({
  LoginUseCase: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@infrastructure/entities/user/user-typeorm.entity', () => ({
  UserTypeormEntity: class UserTypeormEntity {},
}));

jest.mock('@infrastructure/repository/user/user.repository', () => ({
  UserRepository: class UserRepository {},
}));

jest.mock('@infrastructure/services/bcrypt-password-hasher', () => ({
  BcryptPasswordHasher: class BcryptPasswordHasher {},
}));

import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthFactoryModule } from '@http/auth/auth-factory.module';
import { LoginUseCase } from '@usecase/auth/login.usecase';
import type { UserRepository } from '@infrastructure/repository/user/user.repository';
import type { BcryptPasswordHasher } from '@infrastructure/services/bcrypt-password-hasher';

describe('AuthFactoryModule', () => {
  it('should be defined', () => {
    expect(AuthFactoryModule).toBeDefined();
  });

  it('should expose LOGIN_USE_CASE token', () => {
    expect(AuthFactoryModule.LOGIN_USE_CASE).toBe('LoginUseCase');
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = AuthFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(AuthFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(AuthFactoryModule.LOGIN_USE_CASE);
  });

  it('should register JwtModule asynchronously', () => {
    AuthFactoryModule.forRoot();

    expect(JwtModule.registerAsync).toHaveBeenCalled();
  });

  it('should wire LoginUseCase with UserRepository, BcryptPasswordHasher and JwtService via useFactory', () => {
    const module = AuthFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === AuthFactoryModule.LOGIN_USE_CASE,
    );
    const mockRepo: jest.Mocked<InstanceType<typeof UserRepository>> = {
      save: jest.fn(),
      findBy: jest.fn(),
    } as any;
    const mockHasher: jest.Mocked<InstanceType<typeof BcryptPasswordHasher>> = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    const mockJwtService = {} as JwtService;

    factoryProvider.useFactory(mockRepo, mockHasher, mockJwtService);

    expect(LoginUseCase).toHaveBeenCalledWith(
      mockRepo,
      mockHasher,
      mockJwtService,
    );
  });
});
