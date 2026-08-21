import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';
import type { CreateBandBookingUseCaseInterface } from '@usecase/band/interfaces/create-band-booking.usecase.interface';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandFactoryModule } from './band-factory.module';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';
import { ApiCreateBandBooking } from './decorators/create-band-booking.decorator';

type AuthenticatedRequest = { user: { id: string } };

@ApiTags('bands')
@ApiBearerAuth()
@Controller('bands/:id/bookings')
@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)
export class BandBookingController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_BOOKING_USE_CASE)
    private readonly createBandBookingUseCase: CreateBandBookingUseCaseInterface,
  ) {}

  @ApiCreateBandBooking()
  @Post()
  async create(
    @Param() params: FindIdParamDto,
    @Body() dto: CreateBandBookingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.createBandBookingUseCase.execute(
      params.id,
      request.user.id,
      dto,
    );
  }
}
