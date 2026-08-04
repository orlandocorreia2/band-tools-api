import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandMemberEntity } from '@domain/entities/band/band-member.entity';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band/band-member-typeorm.entity';

@Injectable()
export class BandRepository implements IBandRepository {
  constructor(private readonly dataSource: DataSource) {}

  async saveWithOwner(band: BandEntity, ownerUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const bandEntity = manager.create(BandTypeormEntity, band);
      await manager.save(bandEntity);

      const bandMember = new BandMemberEntity({
        band_id: band.id,
        user_id: ownerUserId,
        is_owner: true,
      });
      const bandMemberEntity = manager.create(
        BandMemberTypeormEntity,
        bandMember,
      );
      await manager.save(bandMemberEntity);
    });
  }

  async findById(id: string): Promise<BandEntity | null> {
    const found = await this.dataSource
      .getRepository(BandTypeormEntity)
      .findOneBy({ id });

    return found as unknown as BandEntity | null;
  }

  async findAllByUserId(userId: string): Promise<BandEntity[]> {
    const bands = await this.dataSource
      .getRepository(BandTypeormEntity)
      .createQueryBuilder('band')
      .innerJoin(
        BandMemberTypeormEntity,
        'band_member',
        'band_member.band_id = band.id',
      )
      .where('band_member.user_id = :userId', { userId })
      .orderBy('band.created_at', 'DESC')
      .getMany();

    return bands as unknown as BandEntity[];
  }
}
