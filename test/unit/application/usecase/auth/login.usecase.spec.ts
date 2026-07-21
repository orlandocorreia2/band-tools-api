import { LoginUseCase } from '@usecase/auth/login.usecase';
import type { LoginUseCaseInterface } from '@usecase/auth/interfaces';
import { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { UserEntity } from '@domain/entities/user/user.entity';
import { LoginDto } from '@shared/communication/dtos/auth/login.dto';
import { ApplicationUnauthorizedException } from '@shared/exceptions/business.exception';

type JwtServiceMock = { signAsync: jest.Mock };

const makeDto = (): LoginDto => ({
  email: 'john.lennon@example.com',
  password: 'Password1',
});

const makeUser = (): UserEntity =>
  new UserEntity({
    id: 'user-id',
    first_name: 'John',
    last_name: 'Lennon',
    email: 'john.lennon@example.com',
    phone: '11912345678',
    password: 'hashed-password',
  });

describe('LoginUseCase', () => {
  let useCase: LoginUseCaseInterface;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let jwtService: JwtServiceMock;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findBy: jest.fn().mockResolvedValue(makeUser()),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt'),
    };
    useCase = new LoginUseCase(
      userRepository,
      passwordHasher,
      jwtService as any,
    );
  });

  it('should call repository.findBy with the email from dto', async () => {
    const dto = makeDto();

    await useCase.execute(dto);

    expect(userRepository.findBy).toHaveBeenCalledWith({ email: dto.email });
  });

  it('should throw ApplicationUnauthorizedException when user is not found', async () => {
    userRepository.findBy.mockResolvedValue(null);

    await expect(useCase.execute(makeDto())).rejects.toBeInstanceOf(
      ApplicationUnauthorizedException,
    );
    expect(passwordHasher.compare).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should compare the plain password against the stored hash', async () => {
    const dto = makeDto();
    const user = makeUser();
    userRepository.findBy.mockResolvedValue(user);

    await useCase.execute(dto);

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      dto.password,
      user.password,
    );
  });

  it('should throw ApplicationUnauthorizedException when password does not match', async () => {
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(makeDto())).rejects.toBeInstanceOf(
      ApplicationUnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should sign a JWT with the user id and email as payload', async () => {
    const user = makeUser();
    userRepository.findBy.mockResolvedValue(user);

    await useCase.execute(makeDto());

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
  });

  it('should return a LoginResponseDto with the signed access token', async () => {
    const result = await useCase.execute(makeDto());

    expect(result).toEqual({ accessToken: 'signed-jwt' });
  });
});
