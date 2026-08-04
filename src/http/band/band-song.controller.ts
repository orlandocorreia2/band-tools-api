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
import { CreateBandSongDto } from '@shared/communication/dtos/band/create-band-song.dto';
import { ListBandSongsResponseDto } from '@shared/communication/dtos/band/list-band-songs-response.dto';
import type { CreateBandSongUseCaseInterface } from '@usecase/band/interfaces/create-band-song.usecase.interface';
import type { ListBandSongsUseCaseInterface } from '@usecase/band/interfaces/list-band-songs.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandFactoryModule } from './band-factory.module';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { ApiCreateBandSong } from './decorators/create-band-song.decorator';
import { ApiListBandSongs } from './decorators/list-band-songs.decorator';

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands/:id/songs')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandSongController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_SONG_USE_CASE)
    private readonly createBandSongUseCase: CreateBandSongUseCaseInterface,
    @Inject(BandFactoryModule.LIST_BAND_SONGS_USE_CASE)
    private readonly listBandSongsUseCase: ListBandSongsUseCaseInterface,
  ) {}

  @ApiCreateBandSong()
  @Post()
  async create(
    @Param() params: FindIdParamDto,
    @Body() dto: CreateBandSongDto,
  ): Promise<void> {
    await this.createBandSongUseCase.execute(params.id, dto);
  }

  @ApiListBandSongs()
  @Get()
  async list(
    @Param() params: FindIdParamDto,
  ): Promise<ListBandSongsResponseDto> {
    const bandSongs = await this.listBandSongsUseCase.execute(params.id);

    return ListBandSongsResponseDto.fromEntities(bandSongs);
  }
}
