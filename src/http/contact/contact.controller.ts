import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';
import type { CreateContactUseCaseInterface } from '@usecase/contact/interfaces';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { ContactFactoryModule } from './contact-factory.module';
import { ApiCreateContact } from './decorators/create-contact.decorator';

type AuthenticatedRequest = { user: { id: string } };

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(
    @Inject(ContactFactoryModule.CREATE_CONTACT_USE_CASE)
    private readonly createContactUseCase: CreateContactUseCaseInterface,
  ) {}

  @ApiCreateContact()
  @Post()
  async create(
    @Body() dto: CreateContactDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.createContactUseCase.execute(request.user.id, dto);
  }
}
