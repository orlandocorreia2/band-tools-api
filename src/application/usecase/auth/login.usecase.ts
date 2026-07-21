import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import type { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { LoginDto } from '@shared/communication/dtos/auth/login.dto';
import { LoginResponseDto } from '@shared/communication/dtos/auth/login-response.dto';
import { ApplicationUnauthorizedException } from '@shared/exceptions/business.exception';
import { LoginUseCaseInterface } from './interfaces';

@Injectable()
export class LoginUseCase implements LoginUseCaseInterface {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findBy({ email: dto.email });

    if (!user) {
      throw new ApplicationUnauthorizedException({
        detail: 'E-mail ou senha inválidos',
      });
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ApplicationUnauthorizedException({
        detail: 'E-mail ou senha inválidos',
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return new LoginResponseDto(accessToken);
  }
}
