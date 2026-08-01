import { Injectable } from '@nestjs/common';
import { BandEntity } from '@domain/entities/band/band.entity';
import type { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { ListBandsByUserUseCaseInterface } from './interfaces';

@Injectable()
export class ListBandsByUserUseCase implements ListBandsByUserUseCaseInterface {
  constructor(private readonly bandRepository: IBandRepository) {}

  async execute(userId: string): Promise<BandEntity[]> {
    return this.bandRepository.findAllByUserId(userId);
  }
}
