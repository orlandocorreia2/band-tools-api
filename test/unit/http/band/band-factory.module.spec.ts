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

jest.mock('@usecase/band/list-bands-by-user.usecase', () => ({
  ListBandsByUserUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@usecase/band/create-band-setlist.usecase', () => ({
  CreateBandSetlistUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@usecase/band/list-band-setlists.usecase', () => ({
  ListBandSetlistsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@usecase/band/add-song-to-setlist.usecase', () => ({
  AddSongToSetlistUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@usecase/band/create-band-song.usecase', () => ({
  CreateBandSongUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@usecase/band/list-band-songs.usecase', () => ({
  ListBandSongsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@infrastructure/entities/band/band-typeorm.entity', () => ({
  BandTypeormEntity: class BandTypeormEntity {},
}));

jest.mock(
  '@infrastructure/entities/band/band-member-typeorm.entity',
  () => ({
    BandMemberTypeormEntity: class BandMemberTypeormEntity {},
  }),
);

jest.mock('@infrastructure/entities/user/user-typeorm.entity', () => ({
  UserTypeormEntity: class UserTypeormEntity {},
}));

jest.mock('@infrastructure/entities/band/band-setlist-typeorm.entity', () => ({
  BandSetlistTypeormEntity: class BandSetlistTypeormEntity {},
}));

jest.mock(
  '@infrastructure/entities/band/band-setlist-song-typeorm.entity',
  () => ({
    BandSetlistSongTypeormEntity: class BandSetlistSongTypeormEntity {},
  }),
);

jest.mock('@infrastructure/entities/band/band-song-typeorm.entity', () => ({
  BandSongTypeormEntity: class BandSongTypeormEntity {},
}));

jest.mock('@infrastructure/repository/band/band.repository', () => ({
  BandRepository: class BandRepository {},
}));

jest.mock(
  '@infrastructure/repository/band/band-member.repository',
  () => ({
    BandMemberRepository: class BandMemberRepository {},
  }),
);

jest.mock('@infrastructure/repository/user/user.repository', () => ({
  UserRepository: class UserRepository {},
}));

jest.mock('@infrastructure/repository/band/band-setlist.repository', () => ({
  BandSetlistRepository: class BandSetlistRepository {},
}));

jest.mock(
  '@infrastructure/repository/band/band-setlist-song.repository',
  () => ({
    BandSetlistSongRepository: class BandSetlistSongRepository {},
  }),
);

jest.mock('@infrastructure/repository/band/band-song.repository', () => ({
  BandSongRepository: class BandSongRepository {},
}));

import { BandFactoryModule } from '@http/band/band-factory.module';
import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import { ListBandsByUserUseCase } from '@usecase/band/list-bands-by-user.usecase';
import { CreateBandSetlistUseCase } from '@usecase/band/create-band-setlist.usecase';
import { ListBandSetlistsUseCase } from '@usecase/band/list-band-setlists.usecase';
import { AddSongToSetlistUseCase } from '@usecase/band/add-song-to-setlist.usecase';
import { CreateBandSongUseCase } from '@usecase/band/create-band-song.usecase';
import { ListBandSongsUseCase } from '@usecase/band/list-band-songs.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band/band-member-typeorm.entity';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band/band-setlist-typeorm.entity';
import { BandSetlistSongTypeormEntity } from '@infrastructure/entities/band/band-setlist-song-typeorm.entity';
import { BandSongTypeormEntity } from '@infrastructure/entities/band/band-song-typeorm.entity';
import { BandMemberRepository } from '@infrastructure/repository/band/band-member.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import type { BandRepository } from '@infrastructure/repository/band/band.repository';

describe('BandFactoryModule', () => {
  it('should be defined', () => {
    expect(BandFactoryModule).toBeDefined();
  });

  it('should expose CREATE_BAND_USE_CASE token', () => {
    expect(BandFactoryModule.CREATE_BAND_USE_CASE).toBe('CreateBandUseCase');
  });

  it('should expose LIST_BANDS_BY_USER_USE_CASE token', () => {
    expect(BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE).toBe(
      'ListBandsByUserUseCase',
    );
  });

  it('should expose CREATE_BAND_SETLIST_USE_CASE token', () => {
    expect(BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE).toBe(
      'CreateBandSetlistUseCase',
    );
  });

  it('should expose LIST_BAND_SETLISTS_USE_CASE token', () => {
    expect(BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE).toBe(
      'ListBandSetlistsUseCase',
    );
  });

  it('should expose ADD_SONG_TO_SETLIST_USE_CASE token', () => {
    expect(BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE).toBe(
      'AddSongToSetlistUseCase',
    );
  });

  it('should expose CREATE_BAND_SONG_USE_CASE token', () => {
    expect(BandFactoryModule.CREATE_BAND_SONG_USE_CASE).toBe(
      'CreateBandSongUseCase',
    );
  });

  it('should expose LIST_BAND_SONGS_USE_CASE token', () => {
    expect(BandFactoryModule.LIST_BAND_SONGS_USE_CASE).toBe(
      'ListBandSongsUseCase',
    );
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = BandFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(BandFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toEqual(
      expect.arrayContaining([
        BandFactoryModule.CREATE_BAND_USE_CASE,
        BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
        BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
        BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
        BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE,
        BandFactoryModule.CREATE_BAND_SONG_USE_CASE,
        BandFactoryModule.LIST_BAND_SONGS_USE_CASE,
      ]),
    );
  });

  it('should register all TypeORM entities via TypeOrmModule.forFeature', () => {
    BandFactoryModule.forRoot();

    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([
      BandTypeormEntity,
      BandMemberTypeormEntity,
      UserTypeormEntity,
      BandSetlistTypeormEntity,
      BandSetlistSongTypeormEntity,
      BandSongTypeormEntity,
    ]);
  });

  it('should register all repositories as providers', () => {
    const module = BandFactoryModule.forRoot();

    expect(module.providers).toContain(BandMemberRepository);
    expect(module.providers).toContain(UserRepository);
    expect(module.providers).toContain(BandSetlistRepository);
    expect(module.providers).toContain(BandSetlistSongRepository);
    expect(module.providers).toContain(BandSongRepository);
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

  it('should wire ListBandsByUserUseCase with BandRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE,
    );
    const mockBandRepo: jest.Mocked<InstanceType<typeof BandRepository>> = {
      findAllByUserId: jest.fn(),
    } as any;

    factoryProvider.useFactory(mockBandRepo);

    expect(ListBandsByUserUseCase).toHaveBeenCalledWith(mockBandRepo);
  });

  it('should wire CreateBandSetlistUseCase with BandSetlistRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE,
    );
    const mockBandSetlistRepo = { save: jest.fn() };

    factoryProvider.useFactory(mockBandSetlistRepo);

    expect(CreateBandSetlistUseCase).toHaveBeenCalledWith(mockBandSetlistRepo);
  });

  it('should wire ListBandSetlistsUseCase with BandSetlistRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE,
    );
    const mockBandSetlistRepo = { findAllByBandId: jest.fn() };

    factoryProvider.useFactory(mockBandSetlistRepo);

    expect(ListBandSetlistsUseCase).toHaveBeenCalledWith(mockBandSetlistRepo);
  });

  it('should wire AddSongToSetlistUseCase with BandSetlistSongRepository, BandSetlistRepository and BandSongRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE,
    );
    const mockBandSetlistSongRepo = { save: jest.fn() };
    const mockBandSetlistRepo = { findById: jest.fn() };
    const mockBandSongRepo = { findById: jest.fn() };

    factoryProvider.useFactory(
      mockBandSetlistSongRepo,
      mockBandSetlistRepo,
      mockBandSongRepo,
    );

    expect(AddSongToSetlistUseCase).toHaveBeenCalledWith(
      mockBandSetlistSongRepo,
      mockBandSetlistRepo,
      mockBandSongRepo,
    );
  });

  it('should wire CreateBandSongUseCase with BandSongRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.CREATE_BAND_SONG_USE_CASE,
    );
    const mockBandSongRepo = { save: jest.fn() };

    factoryProvider.useFactory(mockBandSongRepo);

    expect(CreateBandSongUseCase).toHaveBeenCalledWith(mockBandSongRepo);
  });

  it('should wire ListBandSongsUseCase with BandSongRepository via useFactory', () => {
    const module = BandFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === BandFactoryModule.LIST_BAND_SONGS_USE_CASE,
    );
    const mockBandSongRepo = { findAllByBandId: jest.fn() };

    factoryProvider.useFactory(mockBandSongRepo);

    expect(ListBandSongsUseCase).toHaveBeenCalledWith(mockBandSongRepo);
  });
});
