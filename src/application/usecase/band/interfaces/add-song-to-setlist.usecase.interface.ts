import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';

export interface AddSongToSetlistUseCaseInterface {
  execute(
    bandId: string,
    setlistId: string,
    dto: AddSongToSetlistDto,
  ): Promise<void>;
}
