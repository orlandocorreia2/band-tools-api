jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@usecase/band-setlist/create-band-setlist.usecase', () => ({
  CreateBandSetlistUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock(
  '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity',
  () => ({
    BandSetlistTypeormEntity: class BandSetlistTypeormEntity {},
  }),
);

jest.mock(
  '@infrastructure/repository/band-setlist/band-setlist.repository',
  () => ({
    BandSetlistRepository: class BandSetlistRepository {},
  }),
);

import { BandSetlistFactoryModule } from '@http/band-setlist/band-setlist-factory.module';
import { CreateBandSetlistUseCase } from '@usecase/band-setlist/create-band-setlist.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity';
import { BandSetlistRepository } from '@infrastructure/repository/band-setlist/band-setlist.repository';

describe('BandSetlistFactoryModule', () => {
  it('should be defined', () => {
    expect(BandSetlistFactoryModule).toBeDefined();
  });

  it('should expose CREATE_BAND_SETLIST_USE_CASE token', () => {
    expect(BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE).toBe(
      'CreateBandSetlistUseCase',
    );
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = BandSetlistFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(BandSetlistFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(
      BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
    );
  });

  it('should register BandSetlistTypeormEntity via TypeOrmModule.forFeature', () => {
    BandSetlistFactoryModule.forRoot();

    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([
      BandSetlistTypeormEntity,
    ]);
  });

  it('should register BandSetlistRepository as a provider', () => {
    const module = BandSetlistFactoryModule.forRoot();

    expect(module.providers).toContain(BandSetlistRepository);
  });

  it('should wire CreateBandSetlistUseCase with BandSetlistRepository via useFactory', () => {
    const module = BandSetlistFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) =>
        p.provide === BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
    );
    const mockBandSetlistRepo = { save: jest.fn() };

    factoryProvider.useFactory(mockBandSetlistRepo);

    expect(CreateBandSetlistUseCase).toHaveBeenCalledWith(mockBandSetlistRepo);
  });
});
