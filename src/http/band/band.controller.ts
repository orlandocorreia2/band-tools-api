import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces/create-band.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { BandFactoryModule } from './band-factory.module';
import { ApiCreateBand } from './decorators/create-band.decorator';

type AuthenticatedRequest = { user: { id: string } };

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_USE_CASE)
    private readonly createBandUseCase: CreateBandUseCaseInterface,
  ) {}

  @ApiCreateBand()
  @Post()
  async create(
    @Body() dto: CreateBandDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.createBandUseCase.execute(dto, request.user.id);
  }
}
