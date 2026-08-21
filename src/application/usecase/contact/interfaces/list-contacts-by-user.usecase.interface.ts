import { ContactEntity } from '@domain/entities/contact/contact.entity';

export interface ListContactsByUserUseCaseInterface {
  execute(userId: string): Promise<ContactEntity[]>;
}
