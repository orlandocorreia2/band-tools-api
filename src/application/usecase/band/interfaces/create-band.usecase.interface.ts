import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';

export interface CreateBandUseCaseInterface {
  execute(dto: CreateBandDto): Promise<void>;
}
