import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { ListBandsResponseDto } from '@shared/communication/dtos/band/list-bands-response.dto';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces/create-band.usecase.interface';
import type { ListBandsByUserUseCaseInterface } from '@usecase/band/interfaces/list-bands-by-user.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { BandFactoryModule } from './band-factory.module';
import { ApiCreateBand } from './decorators/create-band.decorator';
import { ApiListBands } from './decorators/list-bands.decorator';

type AuthenticatedRequest = { user: { id: string } };

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_USE_CASE)
    private readonly createBandUseCase: CreateBandUseCaseInterface,
    @Inject(BandFactoryModule.LIST_BANDS_BY_USER_USE_CASE)
    private readonly listBandsByUserUseCase: ListBandsByUserUseCaseInterface,
  ) {}

  @ApiCreateBand()
  @Post()
  async create(
    @Body() dto: CreateBandDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.createBandUseCase.execute(dto, request.user.id);
  }

  @ApiListBands()
  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
  ): Promise<ListBandsResponseDto> {
    const bands = await this.listBandsByUserUseCase.execute(request.user.id);

    return ListBandsResponseDto.fromEntities(bands);
  }
}
