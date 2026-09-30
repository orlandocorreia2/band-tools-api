import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { BandBookingTypeormEntity } from '@infrastructure/entities/band/band-booking-typeorm.entity';

@Injectable()
export class BandBookingRepository implements IBandBookingRepository {
  constructor(
    @InjectRepository(BandBookingTypeormEntity)
    private readonly repository: Repository<BandBookingTypeormEntity>,
  ) {}

  async save(bandBooking: BandBookingEntity): Promise<void> {
    const entity = this.repository.create(bandBooking);

    await this.repository.save(entity);
  }

  async findAllByBandId(bandId: string): Promise<BandBookingEntity[]> {
    const bandBookings = await this.repository.find({
      where: { band_id: bandId },
      order: { date: 'ASC', start_time: 'ASC', created_at: 'ASC' },
    });

    return bandBookings as unknown as BandBookingEntity[];
  }
}
