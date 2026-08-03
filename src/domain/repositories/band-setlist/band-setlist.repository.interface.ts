import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';

export interface IBandSetlistRepository {
  save(bandSetlist: BandSetlistEntity): Promise<void>;
  findAllByBandId(bandId: string): Promise<BandSetlistEntity[]>;
}
