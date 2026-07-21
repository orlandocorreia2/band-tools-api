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

jest.mock(
  '@infrastructure/entities/band-member/band-member-typeorm.entity',
  () => ({
    BandMemberTypeormEntity: class BandMemberTypeormEntity {},
  }),
);

jest.mock('@infrastructure/entities/user/user-typeorm.entity', () => ({
  UserTypeormEntity: class UserTypeormEntity {},
}));

jest.mock('@infrastructure/repository/band/band.repository', () => ({
  BandRepository: class BandRepository {},
}));

jest.mock(
  '@infrastructure/repository/band-member/band-member.repository',
  () => ({
    BandMemberRepository: class BandMemberRepository {},
  }),
);

jest.mock('@infrastructure/repository/user/user.repository', () => ({
  UserRepository: class UserRepository {},
}));

import { BandFactoryModule } from '@http/band/band-factory.module';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
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

  it('should register BandTypeormEntity, BandMemberTypeormEntity and UserTypeormEntity via TypeOrmModule.forFeature', () => {
    BandFactoryModule.forRoot();

    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([
      BandTypeormEntity,
      BandMemberTypeormEntity,
      UserTypeormEntity,
    ]);
  });

  it('should register BandMemberRepository and UserRepository as providers', () => {
    const module = BandFactoryModule.forRoot();

    expect(module.providers).toContain(BandMemberRepository);
    expect(module.providers).toContain(UserRepository);
  });

  it('should wire CreateBandUseCase with BandRepository and UserRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.CREATE_BAND_USE_CASE,
    );
    const mockBandRepo: jest.Mocked<InstanceType<typeof BandRepository>> = {
      saveWithOwner: jest.fn(),
    } as any;
    const mockUserRepo = { save: jest.fn(), findBy: jest.fn() };

    factoryProvider.useFactory(mockBandRepo, mockUserRepo);

    expect(CreateBandUseCase).toHaveBeenCalledWith(mockBandRepo, mockUserRepo);
  });
});
