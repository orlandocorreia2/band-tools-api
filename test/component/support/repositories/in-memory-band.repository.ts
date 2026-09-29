import { BandEntity } from '@domain/entities/band/band.entity';
import { BandMemberEntity } from '@domain/entities/band/band-member.entity';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandRepository implements IBandRepository {
  constructor(private readonly store: InMemoryStore) {}

  saveWithOwner(band: BandEntity, ownerUserId: string): Promise<void> {
    this.store.bands.add(band);
    this.store.bandMembers.add(
      new BandMemberEntity({
        band_id: band.id,
        user_id: ownerUserId,
        is_owner: true,
      }),
    );
    return Promise.resolve();
  }

  findById(id: string): Promise<BandEntity | null> {
    return Promise.resolve(this.store.bands.findOne((band) => band.id === id));
  }

  findAllByUserId(userId: string): Promise<BandEntity[]> {
    const bandIds = this.store.bandMembers
      .filter((member) => member.user_id === userId)
      .map((member) => member.band_id);

    const bands = this.store.bands.filter((band) => bandIds.includes(band.id));
    return Promise.resolve(bands.reverse());
  }
}
