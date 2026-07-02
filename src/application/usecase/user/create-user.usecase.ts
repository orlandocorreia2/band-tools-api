import { Injectable } from '@nestjs/common';
import { UserEntity } from '@domain/entities/user/user.entity';
import type { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import type { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';
import { ApplicationConflictException } from '@shared/exceptions/business.exception';
import { CreateUserUseCaseInterface } from './interfaces';

@Injectable()
export class CreateUserUseCase implements CreateUserUseCaseInterface {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const existingUser = await this.userRepository.findBy({
      email: dto.email,
    });

    if (existingUser) {
      throw new ApplicationConflictException({
        detail: 'E-mail already registered',
      });
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const user = new UserEntity({
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  }
}
