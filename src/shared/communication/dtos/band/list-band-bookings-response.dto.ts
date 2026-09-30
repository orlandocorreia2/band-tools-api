import { ApiProperty } from '@nestjs/swagger';
import {
  BandBookingContactPair,
  BandBookingResponseDto,
} from './band-booking-response.dto';

export class ListBandBookingsResponseDto {
  @ApiProperty({ type: [BandBookingResponseDto] })
  readonly data: BandBookingResponseDto[];

  private constructor(data: BandBookingResponseDto[]) {
    this.data = data;
  }

  static fromEntities(
    pairs: BandBookingContactPair[],
  ): ListBandBookingsResponseDto {
    return new ListBandBookingsResponseDto(
      BandBookingResponseDto.fromEntities(pairs),
    );
  }
}
