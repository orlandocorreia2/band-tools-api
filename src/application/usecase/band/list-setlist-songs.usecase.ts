import { Injectable } from '@nestjs/common';
import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import type { IBandSetlistSongRepository } from '@domain/repositories/band/band-setlist-song.repository.interface';
import type { IBandSetlistRepository } from '@domain/repositories/band/band-setlist.repository.interface';
import type { IBandSongRepository } from '@domain/repositories/band/band-song.repository.interface';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';
import { ListSetlistSongsUseCaseInterface, SetlistSong } from './interfaces';

@Injectable()
export class ListSetlistSongsUseCase implements ListSetlistSongsUseCaseInterface {
  constructor(
    private readonly bandSetlistSongRepository: IBandSetlistSongRepository,
    private readonly bandSetlistRepository: IBandSetlistRepository,
    private readonly bandSongRepository: IBandSongRepository,
  ) {}

  async execute(bandId: string, setlistId: string): Promise<SetlistSong[]> {
    await this.assertSetlistBelongsToBand(bandId, setlistId);

    const bandSetlistSongs =
      await this.bandSetlistSongRepository.findAllByBandSetlistId(setlistId);
    const bandSongs = await this.fetchBandSongs(bandSetlistSongs);

    return this.pairSortedByPosition(bandSetlistSongs, bandSongs);
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

  private async fetchBandSongs(
    bandSetlistSongs: BandSetlistSongEntity[],
  ): Promise<BandSongEntity[]> {
    if (bandSetlistSongs.length === 0) {
      return [];
    }

    const bandSongIds = bandSetlistSongs.map((song) => song.band_song_id);

    return this.bandSongRepository.findAllByIds(bandSongIds);
  }

  private pairSortedByPosition(
    bandSetlistSongs: BandSetlistSongEntity[],
    bandSongs: BandSongEntity[],
  ): SetlistSong[] {
    return [...bandSetlistSongs]
      .sort((a, b) => a.position - b.position)
      .map((bandSetlistSong) => ({
        bandSetlistSong,
        bandSong: bandSongs.find(
          (bandSong) => bandSong.id === bandSetlistSong.band_song_id,
        ),
      }));
  }
}
