import { GetHealthCheckResponseDto } from '@shared/communication/dtos/health-check/get-health-check-response.dto';

export interface HealthCheckUseCaseInterface {
  exec(): GetHealthCheckResponseDto;
}
