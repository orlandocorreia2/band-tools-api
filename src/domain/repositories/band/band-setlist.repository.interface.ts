import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';

export interface IBandSetlistRepository {
  save(bandSetlist: BandSetlistEntity): Promise<void>;
  findAllByBandId(bandId: string): Promise<BandSetlistEntity[]>;
  findById(id: string): Promise<BandSetlistEntity | null>;
}
