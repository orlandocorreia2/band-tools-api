import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';

export type SetlistSong = {
  bandSetlistSong: BandSetlistSongEntity;
  bandSong: BandSongEntity;
};

export interface ListSetlistSongsUseCaseInterface {
  execute(bandId: string, setlistId: string): Promise<SetlistSong[]>;
}
