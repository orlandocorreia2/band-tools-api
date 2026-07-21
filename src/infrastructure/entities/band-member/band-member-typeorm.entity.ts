import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('band_members')
export class BandMemberTypeormEntity {
  @PrimaryColumn({ type: 'uuid' })
  band_id: string;

  @Index()
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'boolean', default: false })
  is_owner: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
