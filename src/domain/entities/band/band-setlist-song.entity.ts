import { BaseEntity } from '@domain/entities/base.entity';

type BandSetlistSongProps = {
  id?: string;
  band_setlist_id: string;
  band_song_id: string;
  position: number;
  updated_at?: Date;
};

export class BandSetlistSongEntity extends BaseEntity {
  readonly band_setlist_id: string;
  readonly band_song_id: string;
  readonly position: number;

  constructor(props: BandSetlistSongProps) {
    super(props);
    this.band_setlist_id = props.band_setlist_id;
    this.band_song_id = props.band_song_id;
    this.position = props.position;
  }
}
