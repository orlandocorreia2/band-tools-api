jest.mock('@infrastructure/entities/band/band-typeorm.entity', () => ({
  BandTypeormEntity: class BandTypeormEntity {},
}));

jest.mock(
  '@infrastructure/entities/band-member/band-member-typeorm.entity',
  () => ({
    BandMemberTypeormEntity: class BandMemberTypeormEntity {},
  }),
);

import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandMemberEntity } from '@domain/entities/band-member/band-member.entity';
import { DataSource } from 'typeorm';

describe('BandRepository', () => {
  let bandRepository: BandRepository;
  let manager: { create: jest.Mock; save: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  beforeEach(() => {
    manager = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((work: (manager: unknown) => Promise<void>) =>
          work(manager),
        ),
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
});
