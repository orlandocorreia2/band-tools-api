import { Injectable } from '@nestjs/common';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import type { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';
import { ApplicationUnprocessableEntityException } from '@shared/exceptions/business.exception';
import { CreateBandBookingUseCaseInterface } from './interfaces';

const BRAZIL_UTC_OFFSET_HOURS = 3;

@Injectable()
export class CreateBandBookingUseCase implements CreateBandBookingUseCaseInterface {
  constructor(private readonly bandBookingRepository: IBandBookingRepository) {}

  async execute(bandId: string, dto: CreateBandBookingDto): Promise<void> {
    this.ensureIsFuture(dto.date, dto.start_time);

    const bandBooking = new BandBookingEntity({
      band_id: bandId,
      title: dto.title,
      focal_point_name: dto.focal_point_name,
      phone: dto.phone,
      date: dto.date,
      start_time: dto.start_time,
      duration: dto.duration,
      address: dto.address,
      fee: dto.fee,
      consumption: dto.consumption,
      link: dto.link,
      note: dto.note,
    });

    await this.bandBookingRepository.save(bandBooking);
  }

  private ensureIsFuture(date: Date, startTime: string): void {
    const [hours, minutes] = startTime.split(':').map(Number);
    const scheduledAt = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hours + BRAZIL_UTC_OFFSET_HOURS,
        minutes,
      ),
    );

    if (scheduledAt.getTime() <= Date.now()) {
      throw new ApplicationUnprocessableEntityException({
        detail: 'Validation failed',
        errors: [
          {
            field: 'date',
            detail:
              'the combination of date and start_time must be in the future',
          },
        ],
      });
    }
  }
}
