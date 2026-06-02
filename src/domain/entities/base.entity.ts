import { uuidv7 } from 'uuidv7';

type BaseEntityProps = {
  id?: string;
  updated_at?: Date;
  deleted_at?: Date;
};

export abstract class BaseEntity {
  readonly id: string;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(props: BaseEntityProps) {
    this.id = props.id ?? uuidv7();
    this.created_at = new Date();
    this.updated_at = props.updated_at ?? new Date();
  }
}
