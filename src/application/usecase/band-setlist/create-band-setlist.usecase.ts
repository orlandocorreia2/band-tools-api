import { Injectable } from '@nestjs/common';
import { BandSetlistEntity } from '@domain/entities/band-setlist/band-setlist.entity';
import type { IBandSetlistRepository } from '@domain/repositories/band-setlist/band-setlist.repository.interface';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band-setlist/create-band-setlist.dto';
import { CreateBandSetlistUseCaseInterface } from './interfaces';

@Injectable()
export class CreateBandSetlistUseCase implements CreateBandSetlistUseCaseInterface {
  constructor(private readonly bandSetlistRepository: IBandSetlistRepository) {}

  async execute(bandId: string, dto: CreateBandSetlistDto): Promise<void> {
    const bandSetlist = new BandSetlistEntity({
      band_id: bandId,
      name: dto.name,
    });

    await this.bandSetlistRepository.save(bandSetlist);
  }
}
