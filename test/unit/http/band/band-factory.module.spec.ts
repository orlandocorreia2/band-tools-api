jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@usecase/band/create-band.usecase', () => ({
  CreateBandUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@infrastructure/entities/band/band-typeorm.entity', () => ({
  BandTypeormEntity: class BandTypeormEntity {},
}));

jest.mock('@infrastructure/repository/band/band.repository', () => ({
  BandRepository: class BandRepository {},
}));

import { BandFactoryModule } from '@http/band/band-factory.module';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import type { BandRepository } from '@infrastructure/repository/band/band.repository';

describe('BandFactoryModule', () => {
  it('should be defined', () => {
    expect(BandFactoryModule).toBeDefined();
  });

  it('should expose CREATE_BAND_USE_CASE token', () => {
    expect(BandFactoryModule.CREATE_BAND_USE_CASE).toBe('CreateBandUseCase');
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = BandFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(BandFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(BandFactoryModule.CREATE_BAND_USE_CASE);
  });

  it('should wire CreateBandUseCase with BandRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.CREATE_BAND_USE_CASE,
    );
    const mockRepo: jest.Mocked<InstanceType<typeof BandRepository>> = {
      save: jest.fn(),
    } as any;

    factoryProvider.useFactory(mockRepo);

    expect(CreateBandUseCase).toHaveBeenCalledWith(mockRepo);
  });
});
