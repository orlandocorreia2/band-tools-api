import { Injectable } from '@nestjs/common';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import type { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import { ListBandSetlistsUseCaseInterface } from './interfaces';

@Injectable()
export class ListBandSetlistsUseCase implements ListBandSetlistsUseCaseInterface {
  constructor(private readonly bandSetlistRepository: IBandSetlistRepository) {}

  async execute(bandId: string): Promise<BandSetlistEntity[]> {
    return this.bandSetlistRepository.findAllByBandId(bandId);
  }
}
