import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('band_setlists')
export class BandSetlistTypeormEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  band_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
