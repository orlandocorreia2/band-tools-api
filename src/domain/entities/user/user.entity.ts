import { BaseEntity } from '@domain/entities/base.entity';

type UserProps = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  updated_at?: Date;
  deleted_at?: Date;
};

export class UserEntity extends BaseEntity {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly phone: string;
  readonly password: string;
  readonly avatar?: string;

  constructor(props: UserProps) {
    super(props);
    this.first_name = props.first_name;
    this.last_name = props.last_name;
    this.email = props.email;
    this.phone = props.phone;
    this.password = props.password;
    this.avatar = props.avatar;
  }
}
