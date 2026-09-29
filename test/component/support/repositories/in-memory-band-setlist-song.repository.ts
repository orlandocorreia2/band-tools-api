import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandSetlistSongRepository implements IBandSetlistSongRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandSetlistSong: BandSetlistSongEntity): Promise<void> {
    this.store.bandSetlistSongs.add(bandSetlistSong);
    return Promise.resolve();
  }

  findAllByBandSetlistId(
    bandSetlistId: string,
  ): Promise<BandSetlistSongEntity[]> {
    return Promise.resolve(
      this.store.bandSetlistSongs.filter(
        (setlistSong) => setlistSong.band_setlist_id === bandSetlistId,
      ),
    );
  }
}
