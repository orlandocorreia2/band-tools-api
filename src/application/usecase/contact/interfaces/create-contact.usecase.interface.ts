import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';

export interface CreateContactUseCaseInterface {
  execute(userId: string, dto: CreateContactDto): Promise<void>;
}
