import { Injectable } from '@nestjs/common';
import { name, version } from '@package.json';
import { GetHealthCheckResponseDto } from '@shared/communication/dtos/health-check/get-health-check-response.dto';
import { HealthCheckUseCaseInterface } from './interfaces';

@Injectable()
export class HealthCheckUseCase implements HealthCheckUseCaseInterface {
  exec(): GetHealthCheckResponseDto {
    return {
      status: 'Healthy',
      uptime: process.uptime(),
      name,
      version,
      message: `${name} is up!`,
      timestamp: new Date(),
    };
  }
}
