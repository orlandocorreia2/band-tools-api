import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';

export interface CreateBandUseCaseInterface {
  execute(dto: CreateBandDto, userId: string): Promise<void>;
}
