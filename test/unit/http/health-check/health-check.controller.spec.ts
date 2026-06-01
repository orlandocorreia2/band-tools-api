import type { HealthCheckUseCaseInterface } from '@usecase/health-check/interfaces';
import { GetHealthCheckResponseDto } from '@shared/communication/dtos/health-check/get-health-check-response.dto';
import { HealthCheckController } from '@http/health-check/health-check.controller';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let mockUseCase: jest.Mocked<HealthCheckUseCaseInterface>;

  beforeEach(() => {
    mockUseCase = { exec: jest.fn() };
    controller = new HealthCheckController(mockUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call useCase.exec and return the result', () => {
    const mockResponse: GetHealthCheckResponseDto = {
      status: 'Healthy',
      uptime: 123.45,
      name: 'band-tools-api',
      version: '0.0.1',
      message: 'API is up!',
      timestamp: new Date(),
    };
    mockUseCase.exec.mockReturnValue(mockResponse);

    const result = controller.index();

    expect(mockUseCase.exec).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });
});
