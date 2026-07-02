jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/user/user-typeorm.entity', () => ({
  UserTypeormEntity: class UserTypeormEntity {},
}));

import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserEntity } from '@domain/entities/user/user.entity';
import { Repository } from 'typeorm';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'findOneBy'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findOneBy: jest.fn(),
    };
    userRepository = new UserRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const user = { id: 'uuid', email: 'john@example.com' } as UserEntity;
    const typeormEntity = { id: 'uuid', email: 'john@example.com' };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await userRepository.save(user);

    expect(typeormRepo.create).toHaveBeenCalledWith(user);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const user = { id: 'uuid', email: 'john@example.com' } as UserEntity;
    const typeormEntity = { id: 'uuid', email: 'john@example.com' };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await userRepository.save(user);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });

  it('should call repository.findOneBy with the given filter and return the found entity', async () => {
    const found = { id: 'uuid', email: 'john@example.com' };
    typeormRepo.findOneBy.mockResolvedValue(found);

    const result = await userRepository.findBy({ email: 'john@example.com' });

    expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
      email: 'john@example.com',
    });
    expect(result).toBe(found);
  });

  it('should return null when no entity is found', async () => {
    typeormRepo.findOneBy.mockResolvedValue(null);

    const result = await userRepository.findBy({
      email: 'missing@example.com',
    });

    expect(result).toBeNull();
  });
});
