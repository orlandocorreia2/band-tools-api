import { BandGenreEnum, BandStatusEnum } from '@shared/commons/enums/band.enum';
import { BaseEntity } from '@domain/entities/base.entity';

type BandProps = {
  id?: string;
  name: string;
  genre: BandGenreEnum;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  address: string;
  started_at: Date;
  status?: BandStatusEnum;
  description?: string;
  image?: string;
  updated_at?: Date;
  deleted_at?: Date;
};

export class BandEntity extends BaseEntity {
  readonly name: string;
  readonly genre: BandGenreEnum;
  readonly country: string;
  readonly state: string;
  readonly city: string;
  readonly neighborhood: string;
  readonly address: string;
  readonly started_at: Date;
  readonly status: BandStatusEnum;
  readonly description?: string;
  readonly image?: string;

  constructor(props: BandProps) {
    super(props);
    this.name = props.name;
    this.genre = props.genre;
    this.country = props.country;
    this.state = props.state;
    this.city = props.city;
    this.neighborhood = props.neighborhood;
    this.address = props.address;
    this.started_at = props.started_at;
    this.status = props.status ?? BandStatusEnum.Active;
    this.description = props.description;
    this.image = props.image;
  }
}
