import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BandBookingStatusEnum } from '@shared/commons/enums';
import { formatDateOnly } from '@shared/helpers/format-date-only';

export const feeColumnTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number.parseFloat(value),
};

export const dateColumnTransformer = {
  to: (value: Date): string => formatDateOnly(value),
  from: (value: string): Date => new Date(`${value}T00:00:00.000Z`),
};

@Entity('band_bookings')
export class BandBookingTypeormEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  band_id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Index()
  @Column({ type: 'uuid' })
  contact_id: string;

  @Column({ type: 'date', transformer: dateColumnTransformer })
  date: Date;

  @Column({ type: 'varchar', length: 5 })
  start_time: string;

  @Column({ type: 'varchar' })
  duration: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: feeColumnTransformer,
  })
  fee: number;

  @Column({ type: 'varchar', default: BandBookingStatusEnum.Pending })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  consumption?: string;

  @Column({ type: 'varchar', nullable: true })
  link?: string;

  @Column({ type: 'varchar', nullable: true })
  note?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
