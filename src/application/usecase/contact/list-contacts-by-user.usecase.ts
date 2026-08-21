import { Injectable } from '@nestjs/common';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import type { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { ListContactsByUserUseCaseInterface } from './interfaces';

@Injectable()
export class ListContactsByUserUseCase implements ListContactsByUserUseCaseInterface {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(userId: string): Promise<ContactEntity[]> {
    return this.contactRepository.findAllByUserId(userId);
  }
}
