import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandMemberEntity } from '@domain/entities/band-member/band-member.entity';
import { IBandMemberRepository } from '@domain/repositories/band-member/band-member.repository.interface';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';

@Injectable()
export class BandMemberRepository implements IBandMemberRepository {
  constructor(
    @InjectRepository(BandMemberTypeormEntity)
    private readonly repository: Repository<BandMemberTypeormEntity>,
  ) {}

  async save(bandMember: BandMemberEntity): Promise<void> {
    const entity = this.repository.create(bandMember);

    await this.repository.save(entity);
  }
}
