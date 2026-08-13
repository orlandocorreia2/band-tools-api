import { ContactEntity } from '@domain/entities/contact/contact.entity';

export interface IContactRepository {
  save(contact: ContactEntity): Promise<void>;
}
