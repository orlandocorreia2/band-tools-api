import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';

export interface ListBandSetlistsUseCaseInterface {
  execute(bandId: string): Promise<BandSetlistEntity[]>;
}
