import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';

@Injectable()
export class ContactRepository implements IContactRepository {
  constructor(
    @InjectRepository(ContactTypeormEntity)
    private readonly repository: Repository<ContactTypeormEntity>,
  ) {}

  async save(contact: ContactEntity): Promise<void> {
    const entity = this.repository.create(contact);

    await this.repository.save(entity);
  }
}
