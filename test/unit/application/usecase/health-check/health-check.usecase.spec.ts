import { HealthCheckUseCase } from '@usecase/health-check/health-check.usecase';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;

  beforeEach(() => {
    useCase = new HealthCheckUseCase();
  });

  it('should be call success', () => {
    const result = useCase.exec();

    expect(result).toHaveProperty('status', 'Healthy');
  });
});
