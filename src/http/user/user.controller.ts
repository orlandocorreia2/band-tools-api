import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';
import type { CreateUserUseCaseInterface } from '@usecase/user/interfaces/create-user.usecase.interface';
import { UserFactoryModule } from './user-factory.module';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(UserFactoryModule.CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCaseInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Conflict — email already registered',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity — validation failed',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() dto: CreateUserDto): Promise<void> {
    await this.createUserUseCase.execute(dto);
  }
}
