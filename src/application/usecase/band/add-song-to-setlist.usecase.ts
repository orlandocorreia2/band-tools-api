import { Injectable } from '@nestjs/common';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import type { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import type { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import type { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';
import { AddSongToSetlistUseCaseInterface } from './interfaces';

@Injectable()
export class AddSongToSetlistUseCase implements AddSongToSetlistUseCaseInterface {
  constructor(
    private readonly bandSetlistSongRepository: IBandSetlistSongRepository,
    private readonly bandSetlistRepository: IBandSetlistRepository,
    private readonly bandSongRepository: IBandSongRepository,
  ) {}

  async execute(
    bandId: string,
    setlistId: string,
    dto: AddSongToSetlistDto,
  ): Promise<void> {
    await this.assertSetlistBelongsToBand(bandId, setlistId);
    await this.assertSongBelongsToBand(bandId, dto.bandSongId);

    const position = await this.resolvePosition(setlistId, dto.position);

    const bandSetlistSong = new BandSetlistSongEntity({
      band_setlist_id: setlistId,
      band_song_id: dto.bandSongId,
      position,
    });

    await this.bandSetlistSongRepository.save(bandSetlistSong);
  }

  private async assertSetlistBelongsToBand(
    bandId: string,
    setlistId: string,
  ): Promise<void> {
    const bandSetlist = await this.bandSetlistRepository.findById(setlistId);

    if (bandSetlist?.band_id !== bandId) {
      throw new ApplicationNotFoundException({
        detail: 'Setlist não encontrado',
      });
    }
  }

  private async assertSongBelongsToBand(
    bandId: string,
    bandSongId: string,
  ): Promise<void> {
    const bandSong = await this.bandSongRepository.findById(bandSongId);

    if (bandSong?.band_id !== bandId) {
      throw new ApplicationNotFoundException({
        detail: 'Música não encontrada',
      });
    }
  }

  private async resolvePosition(
    setlistId: string,
    requestedPosition: number,
  ): Promise<number> {
    const existingSongs =
      await this.bandSetlistSongRepository.findAllByBandSetlistId(setlistId);
    const hasCollision = existingSongs.some(
      (song) => song.position === requestedPosition,
    );

    if (!hasCollision) {
      return requestedPosition;
    }

    return Math.max(...existingSongs.map((song) => song.position)) + 1;
  }
}
