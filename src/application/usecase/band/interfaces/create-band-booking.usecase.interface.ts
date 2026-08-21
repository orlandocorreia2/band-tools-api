import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';

export interface CreateBandBookingUseCaseInterface {
  execute(
    bandId: string,
    userId: string,
    dto: CreateBandBookingDto,
  ): Promise<void>;
}
