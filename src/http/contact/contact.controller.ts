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
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';
import { ListContactsResponseDto } from '@shared/communication/dtos/contact/list-contacts-response.dto';
import type {
  CreateContactUseCaseInterface,
  ListContactsByUserUseCaseInterface,
} from '@usecase/contact/interfaces';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { ContactFactoryModule } from './contact-factory.module';
import { ApiCreateContact } from './decorators/create-contact.decorator';
import { ApiListContacts } from './decorators/list-contacts.decorator';

type AuthenticatedRequest = { user: { id: string } };

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(
    @Inject(ContactFactoryModule.CREATE_CONTACT_USE_CASE)
    private readonly createContactUseCase: CreateContactUseCaseInterface,
    @Inject(ContactFactoryModule.LIST_CONTACTS_BY_USER_USE_CASE)
    private readonly listContactsByUserUseCase: ListContactsByUserUseCaseInterface,
  ) {}

  @ApiCreateContact()
  @Post()
  async create(
    @Body() dto: CreateContactDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.createContactUseCase.execute(request.user.id, dto);
  }

  @ApiListContacts()
  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
  ): Promise<ListContactsResponseDto> {
    const contacts = await this.listContactsByUserUseCase.execute(
      request.user.id,
    );

    return ListContactsResponseDto.fromEntities(contacts);
  }
}
