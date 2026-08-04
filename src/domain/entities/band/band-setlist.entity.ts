import { BaseEntity } from '@domain/entities/base.entity';

type BandSetlistProps = {
  id?: string;
  band_id: string;
  name: string;
  updated_at?: Date;
};

export class BandSetlistEntity extends BaseEntity {
  readonly band_id: string;
  readonly name: string;

  constructor(props: BandSetlistProps) {
    super(props);
    this.band_id = props.band_id;
    this.name = props.name;
  }
}
