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

  async findAllByUserId(userId: string): Promise<ContactEntity[]> {
    const contacts = await this.repository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return contacts;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ContactEntity | null> {
    const contact = await this.repository.findOneBy({ id, user_id: userId });

    return contact;
  }
}
