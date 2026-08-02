import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';

export interface ListBandSongsUseCaseInterface {
  execute(bandId: string): Promise<BandSongEntity[]>;
}
