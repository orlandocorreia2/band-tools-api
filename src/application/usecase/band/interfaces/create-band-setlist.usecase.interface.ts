import { CreateBandSetlistDto } from '@shared/communication/dtos/band/create-band-setlist.dto';

export interface CreateBandSetlistUseCaseInterface {
  execute(bandId: string, dto: CreateBandSetlistDto): Promise<void>;
}
