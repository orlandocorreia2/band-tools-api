import { UserController } from '@http/user/user.controller';
import type { CreateUserUseCaseInterface } from '@usecase/user/interfaces/create-user.usecase.interface';
import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';

const makeDto = (): CreateUserDto => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: 'john.lennon@example.com',
  phone: '11912345678',
  password: 'Password1',
});

describe('UserController', () => {
  let controller: UserController;
  let mockUseCase: jest.Mocked<CreateUserUseCaseInterface>;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new UserController(mockUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call useCase.execute with the dto', async () => {
    const dto = makeDto();

    await controller.create(dto);

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should return void (HTTP 201 with no body)', async () => {
    const result = await controller.create(makeDto());

    expect(result).toBeUndefined();
  });
});
