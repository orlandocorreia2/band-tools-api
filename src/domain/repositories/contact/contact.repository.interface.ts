import { ContactEntity } from '@domain/entities/contact/contact.entity';

export interface IContactRepository {
  save(contact: ContactEntity): Promise<void>;
  findAllByUserId(userId: string): Promise<ContactEntity[]>;
  findByIdAndUserId(id: string, userId: string): Promise<ContactEntity | null>;
}
