import { BandSongEntity } from '@domain/entities/band/band-song.entity';

export interface ListBandSongsUseCaseInterface {
  execute(bandId: string): Promise<BandSongEntity[]>;
}
