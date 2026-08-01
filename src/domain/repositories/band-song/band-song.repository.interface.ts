import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';

export interface IBandSongRepository {
  save(bandSong: BandSongEntity): Promise<void>;
}
