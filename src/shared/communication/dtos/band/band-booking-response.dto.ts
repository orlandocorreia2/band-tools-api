import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';
import { BandBookingContactResponseDto } from './band-booking-contact-response.dto';
import { formatDateOnly } from '@shared/helpers/format-date-only';

export type BandBookingContactPair = {
  bandBooking: BandBookingEntity;
  contact: ContactEntity;
};

export class BandBookingResponseDto {
  @ApiProperty({ example: '019a2635-cc34-745e-8d67-f0247e2dcba6' })
  readonly id: string;

  @ApiProperty({ example: 'Show Bar do Zé' })
  readonly title: string;

  @ApiProperty({ example: '2026-09-12', format: 'date' })
  readonly date: string;

  @ApiProperty({ example: '22:00' })
  readonly start_time: string;

  @ApiProperty({ example: '1 hora' })
  readonly duration: string;

  @ApiProperty({ example: 800.0 })
  readonly fee: number;

  @ApiProperty({
    enum: BandBookingStatusEnum,
    example: BandBookingStatusEnum.Pending,
  })
  readonly status: BandBookingStatusEnum;

  @ApiPropertyOptional({
    example: 'Consumação mínima de R$ 50,00 por pessoa',
    nullable: true,
  })
  readonly consumption: string | null;

  @ApiPropertyOptional({
    example: 'https://instagram.com/bardoze',
    nullable: true,
  })
  readonly link: string | null;

  @ApiPropertyOptional({
    example: 'Levar equipamento de som próprio',
    nullable: true,
  })
  readonly note: string | null;

  @ApiProperty({ example: '2026-08-10T12:00:00.000Z' })
  readonly created_at: Date;

  @ApiProperty({ example: '2026-08-10T12:00:00.000Z' })
  readonly updated_at: Date;

  @ApiProperty({ type: BandBookingContactResponseDto })
  readonly contact: BandBookingContactResponseDto;

  private constructor({ bandBooking, contact }: BandBookingContactPair) {
    this.id = bandBooking.id;
    this.title = bandBooking.title;
    this.date = formatDateOnly(bandBooking.date);
    this.start_time = bandBooking.start_time;
    this.duration = bandBooking.duration;
    this.fee = bandBooking.fee;
    this.status = bandBooking.status;
    this.consumption = bandBooking.consumption ?? null;
    this.link = bandBooking.link ?? null;
    this.note = bandBooking.note ?? null;
    this.created_at = bandBooking.created_at;
    this.updated_at = bandBooking.updated_at;
    this.contact = BandBookingContactResponseDto.fromEntity(contact);
  }

  static fromEntity(pair: BandBookingContactPair): BandBookingResponseDto {
    return new BandBookingResponseDto(pair);
  }

  static fromEntities(
    pairs: BandBookingContactPair[],
  ): BandBookingResponseDto[] {
    return pairs.map((pair) => BandBookingResponseDto.fromEntity(pair));
  }
}
