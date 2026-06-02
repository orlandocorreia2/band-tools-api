import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces/create-band.usecase.interface';
import { BandFactoryModule } from './band-factory.module';

@ApiTags('bands')
@Controller('bands')
export class BandController {
  constructor(
    @Inject(BandFactoryModule.CREATE_BAND_USE_CASE)
    private readonly createBandUseCase: CreateBandUseCaseInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new band' })
  @ApiResponse({ status: 201, description: 'Band created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity — validation failed',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() dto: CreateBandDto): Promise<void> {
    await this.createBandUseCase.execute(dto);
  }
}
