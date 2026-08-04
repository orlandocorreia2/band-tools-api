import { BandSongEntity } from '@domain/entities/band/band-song.entity';

export interface IBandSongRepository {
  save(bandSong: BandSongEntity): Promise<void>;
  findAllByBandId(bandId: string): Promise<BandSongEntity[]>;
  findById(id: string): Promise<BandSongEntity | null>;
  findAllByIds(ids: string[]): Promise<BandSongEntity[]>;
}
