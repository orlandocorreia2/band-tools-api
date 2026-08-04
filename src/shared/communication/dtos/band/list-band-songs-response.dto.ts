import { ApiProperty } from '@nestjs/swagger';
import { BandSongEntity } from '@domain/entities/band/band-song.entity';
import { BandSongResponseDto } from './band-song-response.dto';

export class ListBandSongsResponseDto {
  @ApiProperty({ type: [BandSongResponseDto] })
  readonly data: BandSongResponseDto[];

  private constructor(data: BandSongResponseDto[]) {
    this.data = data;
  }

  static fromEntities(bandSongs: BandSongEntity[]): ListBandSongsResponseDto {
    return new ListBandSongsResponseDto(
      BandSongResponseDto.fromEntities(bandSongs),
    );
  }
}
