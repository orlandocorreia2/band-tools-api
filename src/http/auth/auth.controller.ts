import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@shared/communication/dtos/auth/login.dto';
import { LoginResponseDto } from '@shared/communication/dtos/auth/login-response.dto';
import type { LoginUseCaseInterface } from '@usecase/auth/interfaces/login.usecase.interface';
import { AuthFactoryModule } from './auth-factory.module';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthFactoryModule.LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCaseInterface,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — invalid credentials',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity — validation failed',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(dto);
  }
}
