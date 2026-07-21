import { CreateUserUseCase } from '@usecase/user/create-user.usecase';
import type { CreateUserUseCaseInterface } from '@usecase/user/interfaces';
import { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { UserEntity } from '@domain/entities/user/user.entity';
import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';
import { ApplicationConflictException } from '@shared/exceptions/business.exception';

const makeDto = (): CreateUserDto => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: 'john.lennon@example.com',
  phone: '11912345678',
  password: 'Password1',
});

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCaseInterface;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findBy: jest.fn().mockResolvedValue(null),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    useCase = new CreateUserUseCase(userRepository, passwordHasher);
  });

  it('should call repository.findBy with the email from dto', async () => {
    const dto = makeDto();

    await useCase.execute(dto);

    expect(userRepository.findBy).toHaveBeenCalledWith({ email: dto.email });
  });

  it('should throw ApplicationConflictException when email already exists', async () => {
    userRepository.findBy.mockResolvedValue({ id: 'existing' } as UserEntity);

    await expect(useCase.execute(makeDto())).rejects.toBeInstanceOf(
      ApplicationConflictException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should hash the plain password before creating the user', async () => {
    const dto = makeDto();

    await useCase.execute(dto);

    expect(passwordHasher.hash).toHaveBeenCalledWith(dto.password);
  });

  it('should call repository.save with a UserEntity instance', async () => {
    await useCase.execute(makeDto());

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(UserEntity));
  });

  it('should create UserEntity with the hashed password, not the plain one', async () => {
    const dto = makeDto();

    await useCase.execute(dto);

    const savedUser: UserEntity = userRepository.save.mock.calls[0][0];
    expect(savedUser.password).toBe('hashed-password');
    expect(savedUser.password).not.toBe(dto.password);
    expect(savedUser.first_name).toBe(dto.first_name);
    expect(savedUser.last_name).toBe(dto.last_name);
    expect(savedUser.email).toBe(dto.email);
    expect(savedUser.phone).toBe(dto.phone);
  });

  it('should return void', async () => {
    const result = await useCase.execute(makeDto());

    expect(result).toBeUndefined();
  });
});
