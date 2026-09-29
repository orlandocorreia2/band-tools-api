import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryBandSetlistRepository implements IBandSetlistRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(bandSetlist: BandSetlistEntity): Promise<void> {
    this.store.bandSetlists.add(bandSetlist);
    return Promise.resolve();
  }

  findAllByBandId(bandId: string): Promise<BandSetlistEntity[]> {
    return Promise.resolve(
      this.store.bandSetlists.filter((setlist) => setlist.band_id === bandId),
    );
  }

  findById(id: string): Promise<BandSetlistEntity | null> {
    return Promise.resolve(
      this.store.bandSetlists.findOne((setlist) => setlist.id === id),
    );
  }
}
