import { AuthController } from '@http/auth/auth.controller';
import type { LoginUseCaseInterface } from '@usecase/auth/interfaces/login.usecase.interface';
import { LoginDto } from '@shared/communication/dtos/auth/login.dto';
import { LoginResponseDto } from '@shared/communication/dtos/auth/login-response.dto';

const makeDto = (): LoginDto => ({
  email: 'john.lennon@example.com',
  password: 'Password1',
});

describe('AuthController', () => {
  let controller: AuthController;
  let mockUseCase: jest.Mocked<LoginUseCaseInterface>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn().mockResolvedValue(new LoginResponseDto('signed-jwt')),
    };
    controller = new AuthController(mockUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call useCase.execute with the dto', async () => {
    const dto = makeDto();

    await controller.login(dto);

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should return the LoginResponseDto from the use case', async () => {
    const result = await controller.login(makeDto());

    expect(result).toEqual({ accessToken: 'signed-jwt' });
  });
});
