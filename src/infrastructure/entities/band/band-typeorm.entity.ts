import { Column, Entity } from 'typeorm';
import { BandStatusEnum } from '@shared/commons/enums';
import { BaseTypeormEntity } from '../base-typeorm.entity';

@Entity('bands')
export class BandTypeormEntity extends BaseTypeormEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', default: 'Heavy Metal' })
  genre: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', default: BandStatusEnum.Active })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'date' })
  started_at: Date;
}
