import { Injectable } from '@nestjs/common';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import type { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';
import { CreateContactUseCaseInterface } from './interfaces';

@Injectable()
export class CreateContactUseCase implements CreateContactUseCaseInterface {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(userId: string, dto: CreateContactDto): Promise<void> {
    const contact = new ContactEntity({
      user_id: userId,
      name: dto.name,
      phone: dto.phone,
      alternate_phone: dto.alternate_phone,
      venue_name: dto.venue_name,
      address: dto.address,
      email: dto.email,
      role: dto.role,
      notes: dto.notes,
    });

    await this.contactRepository.save(contact);
  }
}
