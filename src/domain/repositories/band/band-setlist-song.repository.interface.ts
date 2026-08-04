import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';

export interface IBandSetlistSongRepository {
  save(bandSetlistSong: BandSetlistSongEntity): Promise<void>;
  findAllByBandSetlistId(
    bandSetlistId: string,
  ): Promise<BandSetlistSongEntity[]>;
}
