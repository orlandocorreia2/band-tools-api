import { BaseEntity } from '@domain/entities/base.entity';

type BandSongProps = {
  id?: string;
  band_id: string;
  title: string;
  tuning?: string;
  tonality?: string;
  bpm?: number;
  duration?: number;
  lyrics?: string;
  notes?: string;
  updated_at?: Date;
};

export class BandSongEntity extends BaseEntity {
  readonly band_id: string;
  readonly title: string;
  readonly tuning?: string;
  readonly tonality?: string;
  readonly bpm?: number;
  readonly duration?: number;
  readonly lyrics?: string;
  readonly notes?: string;

  constructor(props: BandSongProps) {
    super(props);
    this.band_id = props.band_id;
    this.title = props.title;
    this.tuning = props.tuning;
    this.tonality = props.tonality;
    this.bpm = props.bpm;
    this.duration = props.duration;
    this.lyrics = props.lyrics;
    this.notes = props.notes;
  }
}
