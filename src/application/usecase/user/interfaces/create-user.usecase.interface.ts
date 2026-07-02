import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';

export interface CreateUserUseCaseInterface {
  execute(dto: CreateUserDto): Promise<void>;
}
