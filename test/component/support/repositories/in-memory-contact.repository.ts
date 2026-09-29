import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryContactRepository implements IContactRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(contact: ContactEntity): Promise<void> {
    this.store.contacts.add(contact);
    return Promise.resolve();
  }

  findAllByUserId(userId: string): Promise<ContactEntity[]> {
    const contacts = this.store.contacts.filter(
      (contact) => contact.user_id === userId,
    );
    return Promise.resolve(contacts.reverse());
  }

  findByIdAndUserId(id: string, userId: string): Promise<ContactEntity | null> {
    return Promise.resolve(
      this.store.contacts.findOne(
        (contact) => contact.id === id && contact.user_id === userId,
      ),
    );
  }
}
