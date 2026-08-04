import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('band_setlist_songs')
export class BandSetlistSongTypeormEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  band_setlist_id: string;

  @Column({ type: 'uuid' })
  band_song_id: string;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
