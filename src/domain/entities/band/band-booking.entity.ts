import { BaseEntity } from '@domain/entities/base.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';

type BandBookingProps = {
  id?: string;
  band_id: string;
  title: string;
  focal_point_name: string;
  phone: string;
  date: Date;
  start_time: string;
  duration: string;
  address: string;
  fee: number;
  consumption?: string;
  link?: string;
  note?: string;
  updated_at?: Date;
};

export class BandBookingEntity extends BaseEntity {
  readonly band_id: string;
  readonly title: string;
  readonly focal_point_name: string;
  readonly phone: string;
  readonly date: Date;
  readonly start_time: string;
  readonly duration: string;
  readonly address: string;
  readonly fee: number;
  readonly status: BandBookingStatusEnum;
  readonly consumption?: string;
  readonly link?: string;
  readonly note?: string;

  constructor(props: BandBookingProps) {
    super(props);
    this.band_id = props.band_id;
    this.title = props.title;
    this.focal_point_name = props.focal_point_name;
    this.phone = props.phone;
    this.date = props.date;
    this.start_time = props.start_time;
    this.duration = props.duration;
    this.address = props.address;
    this.fee = props.fee;
    this.status = BandBookingStatusEnum.Pending;
    this.consumption = props.consumption;
    this.link = props.link;
    this.note = props.note;
  }
}
