import { BandMemberEntity } from '@domain/entities/band/band-member.entity';

export interface IBandMemberRepository {
  save(bandMember: BandMemberEntity): Promise<void>;
  existsByBandAndUser(bandId: string, userId: string): Promise<boolean>;
}
