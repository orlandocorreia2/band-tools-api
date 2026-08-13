jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

jest.mock('@infrastructure/entities/contact/contact-typeorm.entity', () => ({
  ContactTypeormEntity: class ContactTypeormEntity {},
}));

import { ContactRepository } from '@infrastructure/repository/contact/contact.repository';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { Repository } from 'typeorm';

describe('ContactRepository', () => {
  let contactRepository: ContactRepository;
  let typeormRepo: jest.Mocked<Pick<Repository<any>, 'create' | 'save'>>;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    contactRepository = new ContactRepository(typeormRepo as any);
  });

  it('should be defined', () => {
    expect(contactRepository).toBeDefined();
  });

  it('should call repository.create with the domain entity', async () => {
    const contact = {
      user_id: 'user-uuid',
      name: 'Maria Souza',
    } as unknown as ContactEntity;
    const typeormEntity = { ...contact };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await contactRepository.save(contact);

    expect(typeormRepo.create).toHaveBeenCalledWith(contact);
  });

  it('should call repository.save with the entity returned by create', async () => {
    const contact = {
      user_id: 'user-uuid',
      name: 'Maria Souza',
    } as unknown as ContactEntity;
    const typeormEntity = { ...contact };
    typeormRepo.create.mockReturnValue(typeormEntity);

    await contactRepository.save(contact);

    expect(typeormRepo.save).toHaveBeenCalledWith(typeormEntity);
  });
});
