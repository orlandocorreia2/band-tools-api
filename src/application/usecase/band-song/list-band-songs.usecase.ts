import { Injectable } from '@nestjs/common';
import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';
import type { IBandSongRepository } from '@domain/repositories/band-song/band-song.repository.interface';
import { ListBandSongsUseCaseInterface } from './interfaces';

@Injectable()
export class ListBandSongsUseCase implements ListBandSongsUseCaseInterface {
  constructor(private readonly bandSongRepository: IBandSongRepository) {}

  async execute(bandId: string): Promise<BandSongEntity[]> {
    return this.bandSongRepository.findAllByBandId(bandId);
  }
}
