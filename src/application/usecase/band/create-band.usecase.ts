import { Injectable } from '@nestjs/common';
import { BandEntity } from '@domain/entities/band/band.entity';
import type { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { CreateBandUseCaseInterface } from './interfaces';

@Injectable()
export class CreateBandUseCase implements CreateBandUseCaseInterface {
  constructor(private readonly bandRepository: IBandRepository) {}

  async execute(dto: CreateBandDto): Promise<void> {
    const band = new BandEntity({
      name: dto.name,
      genre: dto.genre,
      state: dto.state,
      city: dto.city,
      neighborhood: dto.neighborhood,
      address: dto.address,
      started_at: dto.started_at,
      description: dto.description,
    });

    await this.bandRepository.save(band);
  }
}
