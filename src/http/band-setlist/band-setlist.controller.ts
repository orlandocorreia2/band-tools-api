import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band-setlist/create-band-setlist.dto';
import type { CreateBandSetlistUseCaseInterface } from '@usecase/band-setlist/interfaces/create-band-setlist.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandSetlistFactoryModule } from './band-setlist-factory.module';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { ApiCreateBandSetlist } from './decorators/create-band-setlist.decorator';

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandSetlistController {
  constructor(
    @Inject(BandSetlistFactoryModule.CREATE_BAND_SETLIST_USE_CASE)
    private readonly createBandSetlistUseCase: CreateBandSetlistUseCaseInterface,
  ) {}

  @ApiCreateBandSetlist()
  @Post(':id/setlists')
  async create(
    @Param() params: FindIdParamDto,
    @Body() dto: CreateBandSetlistDto,
  ): Promise<void> {
    await this.createBandSetlistUseCase.execute(params.id, dto);
  }
}
