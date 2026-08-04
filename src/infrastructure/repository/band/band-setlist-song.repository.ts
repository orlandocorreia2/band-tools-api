import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import { BandSetlistSongTypeormEntity } from '@infrastructure/entities/band/band-setlist-song-typeorm.entity';

@Injectable()
export class BandSetlistSongRepository implements IBandSetlistSongRepository {
  constructor(
    @InjectRepository(BandSetlistSongTypeormEntity)
    private readonly repository: Repository<BandSetlistSongTypeormEntity>,
  ) {}

  async save(bandSetlistSong: BandSetlistSongEntity): Promise<void> {
    const entity = this.repository.create(bandSetlistSong);

    await this.repository.save(entity);
  }

  async findAllByBandSetlistId(
    bandSetlistId: string,
  ): Promise<BandSetlistSongEntity[]> {
    const bandSetlistSongs = await this.repository.find({
      where: { band_setlist_id: bandSetlistId },
      order: { created_at: 'ASC' },
    });

    return bandSetlistSongs;
  }
}
