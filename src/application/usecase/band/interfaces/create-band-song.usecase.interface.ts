import { CreateBandSongDto } from '@shared/communication/dtos/band/create-band-song.dto';

export interface CreateBandSongUseCaseInterface {
  execute(bandId: string, dto: CreateBandSongDto): Promise<void>;
}
