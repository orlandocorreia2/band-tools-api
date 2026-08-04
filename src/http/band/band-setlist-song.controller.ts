import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { AddSongToSetlistParamDto } from '@shared/communication/dtos/band/add-song-to-setlist-param.dto';
import { ListSetlistSongsResponseDto } from '@shared/communication/dtos/band/list-setlist-songs-response.dto';
import type { AddSongToSetlistUseCaseInterface } from '@usecase/band/interfaces/add-song-to-setlist.usecase.interface';
import type { ListSetlistSongsUseCaseInterface } from '@usecase/band/interfaces/list-setlist-songs.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandFactoryModule } from './band-factory.module';
import { ApiAddSongToSetlist } from './decorators/add-song-to-setlist.decorator';
import { ApiListSetlistSongs } from './decorators/list-setlist-songs.decorator';

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands/:id/setlists/:setlistId/songs')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandSetlistSongController {
  constructor(
    @Inject(BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE)
    private readonly addSongToSetlistUseCase: AddSongToSetlistUseCaseInterface,
    @Inject(BandFactoryModule.LIST_SETLIST_SONGS_USE_CASE)
    private readonly listSetlistSongsUseCase: ListSetlistSongsUseCaseInterface,
  ) {}

  @ApiAddSongToSetlist()
  @Post()
  async create(
    @Param() params: AddSongToSetlistParamDto,
    @Body() dto: AddSongToSetlistDto,
  ): Promise<void> {
    await this.addSongToSetlistUseCase.execute(
      params.id,
      params.setlistId,
      dto,
    );
  }

  @ApiListSetlistSongs()
  @Get()
  async list(
    @Param() params: AddSongToSetlistParamDto,
  ): Promise<ListSetlistSongsResponseDto> {
    const setlistSongs = await this.listSetlistSongsUseCase.execute(
      params.id,
      params.setlistId,
    );

    return ListSetlistSongsResponseDto.fromEntities(setlistSongs);
  }
}
