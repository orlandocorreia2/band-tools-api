import { ApiProperty } from '@nestjs/swagger';
import {
  SetlistSongPair,
  SetlistSongResponseDto,
} from './setlist-song-response.dto';

export class ListSetlistSongsResponseDto {
  @ApiProperty({ type: [SetlistSongResponseDto] })
  readonly data: SetlistSongResponseDto[];

  private constructor(data: SetlistSongResponseDto[]) {
    this.data = data;
  }

  static fromEntities(
    setlistSongs: SetlistSongPair[],
  ): ListSetlistSongsResponseDto {
    return new ListSetlistSongsResponseDto(
      SetlistSongResponseDto.fromEntities(setlistSongs),
    );
  }
}
