jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@usecase/user/create-user.usecase', () => ({
  CreateUserUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@infrastructure/persistence/persistence.module', () => ({
  PersistenceModule: class PersistenceModule {},
}));

jest.mock('@infrastructure/repository/user/user.repository', () => ({
  UserRepository: class UserRepository {},
}));

jest.mock('@infrastructure/services/bcrypt-password-hasher', () => ({
  BcryptPasswordHasher: class BcryptPasswordHasher {},
}));

import { UserFactoryModule } from '@http/user/user-factory.module';
import { CreateUserUseCase } from '@usecase/user/create-user.usecase';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { UserRepository as UserRepositoryToken } from '@infrastructure/repository/user/user.repository';
import type { UserRepository } from '@infrastructure/repository/user/user.repository';
import type { BcryptPasswordHasher } from '@infrastructure/services/bcrypt-password-hasher';

describe('UserFactoryModule', () => {
  it('should be defined', () => {
    expect(UserFactoryModule).toBeDefined();
  });

  it('should expose CREATE_USER_USE_CASE token', () => {
    expect(UserFactoryModule.CREATE_USER_USE_CASE).toBe('CreateUserUseCase');
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = UserFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(UserFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(UserFactoryModule.CREATE_USER_USE_CASE);
  });

  it('should import PersistenceModule instead of declaring UserRepository locally', () => {
    const module = UserFactoryModule.forRoot();

    expect(module.imports).toContain(PersistenceModule);
    expect(module.providers).not.toContain(UserRepositoryToken);
  });

  it('should wire CreateUserUseCase with UserRepository and BcryptPasswordHasher via useFactory', () => {
    const module = UserFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === UserFactoryModule.CREATE_USER_USE_CASE,
    );
    const mockRepo: jest.Mocked<InstanceType<typeof UserRepository>> = {
      save: jest.fn(),
      findBy: jest.fn(),
    } as any;
    const mockHasher: jest.Mocked<InstanceType<typeof BcryptPasswordHasher>> = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    factoryProvider.useFactory(mockRepo, mockHasher);

    expect(CreateUserUseCase).toHaveBeenCalledWith(mockRepo, mockHasher);
  });
});
