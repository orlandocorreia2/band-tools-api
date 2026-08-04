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
import { CreateBandSetlistDto } from '@shared/communication/dtos/band/create-band-setlist.dto';
import { ListBandSetlistsResponseDto } from '@shared/communication/dtos/band/list-band-setlists-response.dto';
import type { CreateBandSetlistUseCaseInterface } from '@usecase/band/interfaces/create-band-setlist.usecase.interface';
import type { ListBandSetlistsUseCaseInterface } from '@usecase/band/interfaces/list-band-setlists.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandFactoryModule } from './band-factory.module';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { ApiCreateBandSetlist } from './decorators/create-band-setlist.decorator';
import { ApiListBandSetlists } from './decorators/list-band-setlists.decorator';

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandSetlistController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_SETLIST_USE_CASE)
    private readonly createBandSetlistUseCase: CreateBandSetlistUseCaseInterface,
    @Inject(BandFactoryModule.LIST_BAND_SETLISTS_USE_CASE)
    private readonly listBandSetlistsUseCase: ListBandSetlistsUseCaseInterface,
  ) {}

  @ApiCreateBandSetlist()
  @Post(':id/setlists')
  async create(
    @Param() params: FindIdParamDto,
    @Body() dto: CreateBandSetlistDto,
  ): Promise<void> {
    await this.createBandSetlistUseCase.execute(params.id, dto);
  }

  @ApiListBandSetlists()
  @Get(':id/setlists')
  async list(
    @Param() params: FindIdParamDto,
  ): Promise<ListBandSetlistsResponseDto> {
    const bandSetlists = await this.listBandSetlistsUseCase.execute(params.id);

    return ListBandSetlistsResponseDto.fromEntities(bandSetlists);
  }
}
