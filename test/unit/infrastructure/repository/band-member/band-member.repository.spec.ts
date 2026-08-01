jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock(
  '@infrastructure/entities/band-member/band-member-typeorm.entity',
  () => ({
    BandMemberTypeormEntity: class BandMemberTypeormEntity {},
  }),
);

import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import { BandMemberEntity } from '@domain/entities/band-member/band-member.entity';
import { Repository } from 'typeorm';

describe('BandMemberRepository', () => {
  let bandMemberRepository: BandMemberRepository;
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'existsBy'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      existsBy: jest.fn().mockResolvedValue(false),
    };
    bandMemberRepository = new BandMemberRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(bandMemberRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const bandMember = {
      band_id: 'band-uuid',
      user_id: 'user-uuid',
      is_owner: true,
    } as unknown as BandMemberEntity;
    const typeormEntity = { ...bandMember };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandMemberRepository.save(bandMember);

    expect(typeormRepo.create).toHaveBeenCalledWith(bandMember);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const bandMember = {
      band_id: 'band-uuid',
      user_id: 'user-uuid',
      is_owner: true,
    } as unknown as BandMemberEntity;
    const typeormEntity = { ...bandMember };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await bandMemberRepository.save(bandMember);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });

  describe('existsByBandAndUser', () => {
    it('should call repository.existsBy with band_id and user_id', async () => {
      await bandMemberRepository.existsByBandAndUser('band-uuid', 'user-uuid');

      expect(typeormRepo.existsBy).toHaveBeenCalledWith({
        band_id: 'band-uuid',
        user_id: 'user-uuid',
      });
    });

    it('should return true when a membership exists', async () => {
      typeormRepo.existsBy.mockResolvedValueOnce(true);

      const result = await bandMemberRepository.existsByBandAndUser(
        'band-uuid',
        'user-uuid',
      );

      expect(result).toBe(true);
    });

    it('should return false when no membership exists', async () => {
      typeormRepo.existsBy.mockResolvedValueOnce(false);

      const result = await bandMemberRepository.existsByBandAndUser(
        'band-uuid',
        'user-uuid',
      );

      expect(result).toBe(false);
    });
  });
});
