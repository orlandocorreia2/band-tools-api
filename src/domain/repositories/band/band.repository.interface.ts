import { BandEntity } from '@domain/entities/band/band.entity';

export interface IBandRepository {
  save(band: BandEntity): Promise<void>;
}
