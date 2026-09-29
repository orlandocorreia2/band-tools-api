import { BandMemberEntity } from '@domain/entities/band/band-member.entity';
import { IBandMemberRepository } from '@domain/repositories/band/band-member.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandMemberRepository implements IBandMemberRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandMember: BandMemberEntity): Promise<void> {
    this.store.bandMembers.add(bandMember);
    return Promise.resolve();
  }

  existsByBandAndUser(bandId: string, userId: string): Promise<boolean> {
    const exists = this.store.bandMembers.some(
      (member) => member.band_id === bandId && member.user_id === userId,
    );
    return Promise.resolve(exists);
  }
}
