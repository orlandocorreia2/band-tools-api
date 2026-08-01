import { Injectable } from '@nestjs/common';
import { BandSongEntity } from '@domain/entities/band-song/band-song.entity';
import type { IBandSongRepository } from '@domain/repositories/band-song/band-song.repository.interface';
import { CreateBandSongDto } from '@shared/communication/dtos/band-song/create-band-song.dto';
import { CreateBandSongUseCaseInterface } from './interfaces';

@Injectable()
export class CreateBandSongUseCase implements CreateBandSongUseCaseInterface {
  constructor(private readonly bandSongRepository: IBandSongRepository) {}

  async execute(bandId: string, dto: CreateBandSongDto): Promise<void> {
    const bandSong = new BandSongEntity({
      band_id: bandId,
      title: dto.title,
      tuning: dto.tuning,
      tonality: dto.tonality,
      bpm: dto.bpm,
      duration: dto.duration,
      lyrics: dto.lyrics,
      notes: dto.notes,
    });

    await this.bandSongRepository.save(bandSong);
  }
}
