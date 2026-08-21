import { ListContactsByUserUseCase } from '@usecase/contact/list-contacts-by-user.usecase';
import type { ListContactsByUserUseCaseInterface } from '@usecase/contact/interfaces';
import { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const userId = 'user-uuid';

const makeContact = (id: string): ContactEntity =>
  ({ id, user_id: userId, name: 'Maria Souza' }) as unknown as ContactEntity;

describe('ListContactsByUserUseCase', () => {
  let useCase: ListContactsByUserUseCaseInterface;
  let contactRepository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByUserId: jest.fn().mockResolvedValue([]),
    };
    useCase = new ListContactsByUserUseCase(contactRepository);
  });

  it('should call repository.findAllByUserId with the given userId', async () => {
    await useCase.execute(userId);

    expect(contactRepository.findAllByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return the contacts returned by the repository', async () => {
    const contacts = [makeContact('contact-1'), makeContact('contact-2')];
    contactRepository.findAllByUserId.mockResolvedValueOnce(contacts);

    const result = await useCase.execute(userId);

    expect(result).toBe(contacts);
  });

  it('should return an empty array when the repository finds no contacts', async () => {
    const result = await useCase.execute(userId);

    expect(result).toEqual([]);
  });
});
