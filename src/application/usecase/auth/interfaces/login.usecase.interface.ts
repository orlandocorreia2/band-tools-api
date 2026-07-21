import { LoginDto } from '@shared/communication/dtos/auth/login.dto';
import { LoginResponseDto } from '@shared/communication/dtos/auth/login-response.dto';

export interface LoginUseCaseInterface {
  execute(dto: LoginDto): Promise<LoginResponseDto>;
}
