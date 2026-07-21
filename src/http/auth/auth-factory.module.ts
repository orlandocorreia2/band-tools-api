import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '@usecase/auth/login.usecase';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BcryptPasswordHasher } from '@infrastructure/services/bcrypt-password-hasher';
import { EnvConfigModule } from '@shared/config/env-config.module';
import { jwtModuleAsyncOptions } from '@shared/config/jwt-module-options';

@Module({})
export class AuthFactoryModule {
  static readonly LOGIN_USE_CASE = 'LoginUseCase';

  static forRoot(): DynamicModule {
    return {
      module: AuthFactoryModule,
      imports: [
        TypeOrmModule.forFeature([UserTypeormEntity]),
        EnvConfigModule,
        JwtModule.registerAsync(jwtModuleAsyncOptions),
      ],
      providers: [
        UserRepository,
        BcryptPasswordHasher,
        {
          provide: AuthFactoryModule.LOGIN_USE_CASE,
          inject: [UserRepository, BcryptPasswordHasher, JwtService],
          useFactory: (
            userRepository: UserRepository,
            passwordHasher: BcryptPasswordHasher,
            jwtService: JwtService,
          ) => new LoginUseCase(userRepository, passwordHasher, jwtService),
        },
      ],
      exports: [AuthFactoryModule.LOGIN_USE_CASE],
    };
  }
}
