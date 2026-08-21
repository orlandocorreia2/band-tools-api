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
  let typeormRepo: jest.Mocked<
    Pick<Repository<any>, 'create' | 'save' | 'find'>
  >;

  beforeEach(() => {
    typeormRepo = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
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

  describe('findAllByUserId', () => {
    it('should call repository.find filtering by user_id and ordering by created_at DESC', async () => {
      await contactRepository.findAllByUserId('user-uuid');

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-uuid' },
        order: { created_at: 'DESC' },
      });
    });

    it('should return the contacts returned by the repository', async () => {
      const contacts = [
        { id: 'contact-1', user_id: 'user-uuid' },
        { id: 'contact-2', user_id: 'user-uuid' },
      ];
      typeormRepo.find.mockResolvedValueOnce(contacts as any);

      const result = await contactRepository.findAllByUserId('user-uuid');

      expect(result).toBe(contacts);
    });

    it('should return an empty array when the repository finds no contacts', async () => {
      const result = await contactRepository.findAllByUserId('user-uuid');

      expect(result).toEqual([]);
    });
  });
});
