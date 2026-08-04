import { ApiProperty } from '@nestjs/swagger';
import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';
import { BandSetlistResponseDto } from './band-setlist-response.dto';

export class ListBandSetlistsResponseDto {
  @ApiProperty({ type: [BandSetlistResponseDto] })
  readonly data: BandSetlistResponseDto[];

  private constructor(data: BandSetlistResponseDto[]) {
    this.data = data;
  }

  static fromEntities(
    bandSetlists: BandSetlistEntity[],
  ): ListBandSetlistsResponseDto {
    return new ListBandSetlistsResponseDto(
      BandSetlistResponseDto.fromEntities(bandSetlists),
    );
  }
}
