jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@usecase/band-song/create-band-song.usecase', () => ({
  CreateBandSongUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock(
  '@infrastructure/entities/band-song/band-song-typeorm.entity',
  () => ({
    BandSongTypeormEntity: class BandSongTypeormEntity {},
  }),
);

jest.mock('@infrastructure/repository/band-song/band-song.repository', () => ({
  BandSongRepository: class BandSongRepository {},
}));

import { BandSongFactoryModule } from '@http/band-song/band-song-factory.module';
import { CreateBandSongUseCase } from '@usecase/band-song/create-band-song.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandSongTypeormEntity } from '@infrastructure/entities/band-song/band-song-typeorm.entity';
import { BandSongRepository } from '@infrastructure/repository/band-song/band-song.repository';

describe('BandSongFactoryModule', () => {
  it('should be defined', () => {
    expect(BandSongFactoryModule).toBeDefined();
  });

  it('should expose CREATE_BAND_SONG_USE_CASE token', () => {
    expect(BandSongFactoryModule.CREATE_BAND_SONG_USE_CASE).toBe(
      'CreateBandSongUseCase',
    );
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = BandSongFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(BandSongFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(
      BandSongFactoryModule.CREATE_BAND_SONG_USE_CASE,
    );
  });

  it('should register BandSongTypeormEntity via TypeOrmModule.forFeature', () => {
    BandSongFactoryModule.forRoot();

    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([
      BandSongTypeormEntity,
    ]);
  });

  it('should register BandSongRepository as a provider', () => {
    const module = BandSongFactoryModule.forRoot();

    expect(module.providers).toContain(BandSongRepository);
  });

  it('should wire CreateBandSongUseCase with BandSongRepository via useFactory', () => {
    const module = BandSongFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandSongFactoryModule.CREATE_BAND_SONG_USE_CASE,
    );
    const mockBandSongRepo = { save: jest.fn() };

    factoryProvider.useFactory(mockBandSongRepo);

    expect(CreateBandSongUseCase).toHaveBeenCalledWith(mockBandSongRepo);
  });
});
