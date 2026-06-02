jest.mock('@infrastructure/typeorm/typeorm.module', () => ({
  TypeormModule: class TypeormModule {},
}));

import { InfrastructureModule } from '@infrastructure/infrastructure.module';

describe('InfrastructureModule', () => {
  it('should be defined', () => {
    expect(InfrastructureModule).toBeDefined();
  });

  it('should be instantiable', () => {
    expect(new InfrastructureModule()).toBeInstanceOf(InfrastructureModule);
  });

  it('should log initialization message on onModuleInit', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const module = new InfrastructureModule();

    module.onModuleInit();

    expect(consoleSpy).toHaveBeenCalledWith(
      'The InfrastructureModule has been initialized.',
    );
    consoleSpy.mockRestore();
  });
});
