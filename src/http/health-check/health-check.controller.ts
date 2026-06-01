import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetHealthCheckResponseDto } from '@shared/communication/dtos/health-check/get-health-check-response.dto';
import type { HealthCheckUseCaseInterface } from '@usecase/health-check/interfaces';
import { HealthCheckFactoryModule } from './health-check-factory.module';

@Controller('/health')
@ApiTags('Health')
export class HealthCheckController {
  constructor(
    @Inject(HealthCheckFactoryModule.HEALTH_CHECK_USE_CASE)
    private readonly healthCheckUseCase: HealthCheckUseCaseInterface,
  ) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health Check.',
    type: GetHealthCheckResponseDto,
  })
  index(): GetHealthCheckResponseDto {
    return this.healthCheckUseCase.exec();
  }
}
