import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandEntity } from '@domain/entities/band/band.entity';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';

@Injectable()
export class BandRepository implements IBandRepository {
  constructor(
    @InjectRepository(BandTypeormEntity)
    private readonly repository: Repository<BandTypeormEntity>,
  ) {}

  async save(band: BandEntity): Promise<void> {
    const entity = this.repository.create(band);

    await this.repository.save(entity);
  }
}
