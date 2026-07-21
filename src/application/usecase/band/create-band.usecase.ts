import { Injectable } from '@nestjs/common';
import { BandEntity } from '@domain/entities/band/band.entity';
import type { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import type { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';
import { CreateBandUseCaseInterface } from './interfaces';

@Injectable()
export class CreateBandUseCase implements CreateBandUseCaseInterface {
  constructor(
    private readonly bandRepository: IBandRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateBandDto, userId: string): Promise<void> {
    const user = await this.userRepository.findBy({ id: userId });

    if (!user) {
      throw new ApplicationNotFoundException({
        detail: 'Usuário autenticado não encontrado',
      });
    }

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

    await this.bandRepository.saveWithOwner(band, userId);
  }
}
