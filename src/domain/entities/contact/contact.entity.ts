import { BaseEntity } from '@domain/entities/base.entity';

type ContactProps = {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  venue_name: string;
  address: string;
  email: string;
  role: string;
  notes?: string;
  updated_at?: Date;
};

export class ContactEntity extends BaseEntity {
  readonly user_id: string;
  readonly name: string;
  readonly phone: string;
  readonly alternate_phone?: string;
  readonly venue_name: string;
  readonly address: string;
  readonly email: string;
  readonly role: string;
  readonly notes?: string;

  constructor(props: ContactProps) {
    super(props);
    this.user_id = props.user_id;
    this.name = props.name;
    this.phone = props.phone;
    this.alternate_phone = props.alternate_phone;
    this.venue_name = props.venue_name;
    this.address = props.address;
    this.email = props.email;
    this.role = props.role;
    this.notes = props.notes;
  }
}
