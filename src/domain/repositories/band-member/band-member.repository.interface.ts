import { BandMemberEntity } from '@domain/entities/band-member/band-member.entity';

export interface IBandMemberRepository {
  save(bandMember: BandMemberEntity): Promise<void>;
}
