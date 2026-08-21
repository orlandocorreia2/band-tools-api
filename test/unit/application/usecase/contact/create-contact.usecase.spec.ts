import { CreateContactUseCase } from '@usecase/contact/create-contact.usecase';
import type { CreateContactUseCaseInterface } from '@usecase/contact/interfaces';
import { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';

const userId = 'user-uuid';

const makeDto = (
  overrides: Partial<CreateContactDto> = {},
): CreateContactDto => ({
  name: 'Maria Souza',
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
  ...overrides,
});

describe('CreateContactUseCase', () => {
  let useCase: CreateContactUseCaseInterface;
  let contactRepository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByUserId: jest.fn().mockResolvedValue([]),
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
    };
    useCase = new CreateContactUseCase(contactRepository);
  });

  it('should call contactRepository.save with a ContactEntity instance', async () => {
    await useCase.execute(userId, makeDto());

    expect(contactRepository.save).toHaveBeenCalledTimes(1);
    expect(contactRepository.save).toHaveBeenCalledWith(
      expect.any(ContactEntity),
    );
  });

  it('should create ContactEntity with the correct required props from dto and userId', async () => {
    const dto = makeDto();
    await useCase.execute(userId, dto);

    const saved: ContactEntity = contactRepository.save.mock.calls[0][0];
    expect(saved.user_id).toBe(userId);
    expect(saved.name).toBe(dto.name);
    expect(saved.phone).toBe(dto.phone);
    expect(saved.venue_name).toBe(dto.venue_name);
    expect(saved.address).toBe(dto.address);
    expect(saved.email).toBe(dto.email);
    expect(saved.role).toBe(dto.role);
  });

  it('should create ContactEntity with optional fields when provided', async () => {
    const dto = makeDto({
      alternate_phone: '1133654321',
      notes: 'Prefere contato via WhatsApp',
    });
    await useCase.execute(userId, dto);

    const saved: ContactEntity = contactRepository.save.mock.calls[0][0];
    expect(saved.alternate_phone).toBe(dto.alternate_phone);
    expect(saved.notes).toBe(dto.notes);
  });

  it('should create ContactEntity with optional fields as undefined when not provided', async () => {
    await useCase.execute(userId, makeDto());

    const saved: ContactEntity = contactRepository.save.mock.calls[0][0];
    expect(saved.alternate_phone).toBeUndefined();
    expect(saved.notes).toBeUndefined();
  });
});
