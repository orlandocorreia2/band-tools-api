import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';
import { IBandSetlistRepository } from '@domain/repositories/band-setlist/band-setlist.repository.interface';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band-setlist/band-setlist-typeorm.entity';

@Injectable()
export class BandSetlistRepository implements IBandSetlistRepository {
  constructor(
    @InjectRepository(BandSetlistTypeormEntity)
    private readonly repository: Repository<BandSetlistTypeormEntity>,
  ) {}

  async save(bandSetlist: BandSetlistEntity): Promise<void> {
    const entity = this.repository.create(bandSetlist);

    await this.repository.save(entity);
  }

  async findAllByBandId(bandId: string): Promise<BandSetlistEntity[]> {
    const bandSetlists = await this.repository.find({
      where: { band_id: bandId },
      order: { created_at: 'ASC' },
    });

    return bandSetlists;
  }
}
