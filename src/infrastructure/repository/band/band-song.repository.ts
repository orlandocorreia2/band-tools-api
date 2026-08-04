import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { BandSongTypeormEntity } from '@infrastructure/entities/band/band-song-typeorm.entity';

@Injectable()
export class BandSongRepository implements IBandSongRepository {
  constructor(
    @InjectRepository(BandSongTypeormEntity)
    private readonly repository: Repository<BandSongTypeormEntity>,
  ) {}

  async save(bandSong: BandSongEntity): Promise<void> {
    const entity = this.repository.create(bandSong);

    await this.repository.save(entity);
  }

  async findAllByBandId(bandId: string): Promise<BandSongEntity[]> {
    const bandSongs = await this.repository.find({
      where: { band_id: bandId },
      order: { created_at: 'ASC' },
    });

    return bandSongs;
  }

  async findById(id: string): Promise<BandSongEntity | null> {
    const found = await this.repository.findOneBy({ id });

    return found;
  }

  async findAllByIds(ids: string[]): Promise<BandSongEntity[]> {
    const bandSongs = await this.repository.findBy({ id: In(ids) });

    return bandSongs;
  }
}
