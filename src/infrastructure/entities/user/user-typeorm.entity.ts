import { Column, Entity } from 'typeorm';
import { BaseTypeormEntity } from '../base-typeorm.entity';

@Entity('users')
export class UserTypeormEntity extends BaseTypeormEntity {
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 11 })
  phone: string;

  @Column({ type: 'varchar', length: 60 })
  password: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;
}
