import { ApiProperty } from '@nestjs/swagger';
import { BandEntity } from '@domain/entities/band/band.entity';
import { BandResponseDto } from './band-response.dto';

export class ListBandsResponseDto {
  @ApiProperty({ type: [BandResponseDto] })
  readonly data: BandResponseDto[];

  private constructor(data: BandResponseDto[]) {
    this.data = data;
  }

  static fromEntities(bands: BandEntity[]): ListBandsResponseDto {
    return new ListBandsResponseDto(BandResponseDto.fromEntities(bands));
  }
}
