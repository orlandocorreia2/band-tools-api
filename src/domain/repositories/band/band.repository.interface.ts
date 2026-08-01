import { BandEntity } from '@domain/entities/band/band.entity';

export interface IBandRepository {
  saveWithOwner(band: BandEntity, ownerUserId: string): Promise<void>;
  findById(id: string): Promise<BandEntity | null>;
  findAllByUserId(userId: string): Promise<BandEntity[]>;
}
