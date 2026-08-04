import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';
import { AddSongToSetlistParamDto } from '@shared/communication/dtos/band/add-song-to-setlist-param.dto';
import type { AddSongToSetlistUseCaseInterface } from '@usecase/band/interfaces/add-song-to-setlist.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandFactoryModule } from './band-factory.module';
import { ApiAddSongToSetlist } from './decorators/add-song-to-setlist.decorator';

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandSetlistSongController {
  constructor(
    @Inject(BandFactoryModule.ADD_SONG_TO_SETLIST_USE_CASE)
    private readonly addSongToSetlistUseCase: AddSongToSetlistUseCaseInterface,
  ) {}

  @ApiAddSongToSetlist()
  @Post(':id/setlists/:setlistId/songs')
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
}
