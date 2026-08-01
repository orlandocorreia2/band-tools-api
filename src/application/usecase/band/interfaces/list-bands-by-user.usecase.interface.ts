import { BandEntity } from '@domain/entities/band/band.entity';

export interface ListBandsByUserUseCaseInterface {
  execute(userId: string): Promise<BandEntity[]>;
}
