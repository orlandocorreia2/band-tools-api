import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandSongRepository implements IBandSongRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandSong: BandSongEntity): Promise<void> {
    this.store.bandSongs.add(bandSong);
    return Promise.resolve();
  }

  findAllByBandId(bandId: string): Promise<BandSongEntity[]> {
    return Promise.resolve(
      this.store.bandSongs.filter((song) => song.band_id === bandId),
    );
  }

  findById(id: string): Promise<BandSongEntity | null> {
    return Promise.resolve(
      this.store.bandSongs.findOne((song) => song.id === id),
    );
  }

  findAllByIds(ids: string[]): Promise<BandSongEntity[]> {
    return Promise.resolve(
      this.store.bandSongs.filter((song) => ids.includes(song.id)),
    );
  }
}
