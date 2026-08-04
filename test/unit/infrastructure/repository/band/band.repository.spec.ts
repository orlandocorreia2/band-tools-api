jest.mock('@infrastructure/entities/band/band-typeorm.entity', () => ({
  BandTypeormEntity: class BandTypeormEntity {},
}));

jest.mock(
  '@infrastructure/entities/band/band-member-typeorm.entity',
  () => ({
    BandMemberTypeormEntity: class BandMemberTypeormEntity {},
  }),
);

import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandMemberEntity } from '@domain/entities/band/band-member.entity';
import { DataSource } from 'typeorm';

describe('BandRepository', () => {
  let bandRepository: BandRepository;
  let manager: { create: jest.Mock; save: jest.Mock };
  let queryBuilder: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
  };
  let bandTypeormRepository: {
    findOneBy: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let dataSource: jest.Mocked<
    Pick<DataSource, 'transaction' | 'getRepository'>
  >;

  beforeEach(() => {
    manager = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    bandTypeormRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((work: (manager: unknown) => Promise<void>) =>
          work(manager),
        ),
      getRepository: jest.fn().mockReturnValue(bandTypeormRepository),
    };
    bandRepository = new BandRepository(dataSource as unknown as DataSource);
  });

  it('should be defined', () => {
    expect(bandRepository).toBeDefined();
  });

  describe('saveWithOwner', () => {
    const band = {
      id: 'band-uuid',
      name: 'The Beatles',
    } as unknown as BandEntity;
    const ownerUserId = 'user-uuid';

    it('should run both persistence operations inside a single transaction', async () => {
      await bandRepository.saveWithOwner(band, ownerUserId);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('should create and save the band through the transaction manager', async () => {
      const bandTypeormEntity = { id: 'band-uuid' };
      manager.create.mockReturnValueOnce(bandTypeormEntity);

      await bandRepository.saveWithOwner(band, ownerUserId);

      expect(manager.create).toHaveBeenCalledWith(expect.anything(), band);
      expect(manager.save).toHaveBeenCalledWith(bandTypeormEntity);
    });

    it('should create and save the owner band_member through the transaction manager', async () => {
      const bandMemberTypeormEntity = {
        band_id: 'band-uuid',
        user_id: ownerUserId,
        is_owner: true,
      };
      manager.create.mockReturnValueOnce({ id: 'band-uuid' });
      manager.create.mockReturnValueOnce(bandMemberTypeormEntity);

      await bandRepository.saveWithOwner(band, ownerUserId);

      const [, bandMemberArg] = manager.create.mock.calls[1] as [
        unknown,
        BandMemberEntity,
      ];
      expect(bandMemberArg).toBeInstanceOf(BandMemberEntity);
      expect(bandMemberArg.band_id).toBe(band.id);
      expect(bandMemberArg.user_id).toBe(ownerUserId);
      expect(bandMemberArg.is_owner).toBe(true);
      expect(manager.save).toHaveBeenCalledWith(bandMemberTypeormEntity);
    });

    it('should propagate the error and not swallow a failed membership creation', async () => {
      manager.save.mockRejectedValueOnce(
        new Error('band member insert failed'),
      );

      await expect(
        bandRepository.saveWithOwner(band, ownerUserId),
      ).rejects.toThrow('band member insert failed');
    });
  });

  describe('findById', () => {
    it('should return the band when found', async () => {
      const found = { id: 'band-uuid', name: 'The Beatles' };
      bandTypeormRepository.findOneBy.mockResolvedValueOnce(found);

      const result = await bandRepository.findById('band-uuid');

      expect(result).toBe(found);
      expect(bandTypeormRepository.findOneBy).toHaveBeenCalledWith({
        id: 'band-uuid',
      });
    });

    it('should return null when not found', async () => {
      const result = await bandRepository.findById('missing-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findAllByUserId', () => {
    const userId = 'user-uuid';

    it('should join band_members and filter by the given userId', async () => {
      await bandRepository.findAllByUserId(userId);

      expect(bandTypeormRepository.createQueryBuilder).toHaveBeenCalledWith(
        'band',
      );
      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        expect.anything(),
        'band_member',
        'band_member.band_id = band.id',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'band_member.user_id = :userId',
        { userId },
      );
    });

    it('should order results by created_at descending', async () => {
      await bandRepository.findAllByUserId(userId);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'band.created_at',
        'DESC',
      );
    });

    it('should return the bands found by the query', async () => {
      const bands = [{ id: 'band-1' }, { id: 'band-2' }];
      queryBuilder.getMany.mockResolvedValueOnce(bands);

      const result = await bandRepository.findAllByUserId(userId);

      expect(result).toBe(bands);
    });

    it('should return an empty array when the user has no bands', async () => {
      const result = await bandRepository.findAllByUserId(userId);

      expect(result).toEqual([]);
    });
  });
});
