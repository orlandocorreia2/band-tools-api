import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';

export interface ListBandSetlistsUseCaseInterface {
  execute(bandId: string): Promise<BandSetlistEntity[]>;
}
