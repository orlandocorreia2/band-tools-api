import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from '@usecase/user/create-user.usecase';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BcryptPasswordHasher } from '@infrastructure/services/bcrypt-password-hasher';
import { EnvConfigModule } from '@shared/config/env-config.module';

@Module({})
export class UserFactoryModule {
  static readonly CREATE_USER_USE_CASE = 'CreateUserUseCase';

  static forRoot(): DynamicModule {
    return {
      module: UserFactoryModule,
      imports: [TypeOrmModule.forFeature([UserTypeormEntity]), EnvConfigModule],
      providers: [
        UserRepository,
        BcryptPasswordHasher,
        {
          provide: UserFactoryModule.CREATE_USER_USE_CASE,
          inject: [UserRepository, BcryptPasswordHasher],
          useFactory: (
            userRepository: UserRepository,
            passwordHasher: BcryptPasswordHasher,
          ) => new CreateUserUseCase(userRepository, passwordHasher),
        },
      ],
      exports: [UserFactoryModule.CREATE_USER_USE_CASE],
    };
  }
}
