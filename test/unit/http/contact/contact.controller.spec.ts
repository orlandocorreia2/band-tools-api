import { ContactController } from '@http/contact/contact.controller';
import type { CreateContactUseCaseInterface } from '@usecase/contact/interfaces/create-contact.usecase.interface';
import type { ListContactsByUserUseCaseInterface } from '@usecase/contact/interfaces/list-contacts-by-user.usecase.interface';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';
import { ListContactsResponseDto } from '@shared/communication/dtos/contact/list-contacts-response.dto';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makeDto = (): CreateContactDto => ({
  name: 'Maria Souza',
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const makeRequest = (userId = 'user-uuid') => ({
  user: { id: userId, email: 'john@example.com' },
});

const makeContact = (id: string): ContactEntity =>
  ({ id, name: 'Maria Souza' }) as unknown as ContactEntity;

describe('ContactController', () => {
  let controller: ContactController;
  let mockCreateUseCase: jest.Mocked<CreateContactUseCaseInterface>;
  let mockListUseCase: jest.Mocked<ListContactsByUserUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockListUseCase = { execute: jest.fn().mockResolvedValue([]) };
    controller = new ContactController(mockCreateUseCase, mockListUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call useCase.execute with the authenticated user id and dto', async () => {
      const dto = makeDto();
      const request = makeRequest();

      await controller.create(dto, request);

      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(
        request.user.id,
        dto,
      );
    });

    it('should return void (HTTP 201 with no body)', async () => {
      const result = await controller.create(makeDto(), makeRequest());

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should call useCase.execute with the authenticated user id', async () => {
      const request = makeRequest();

      await controller.list(request);

      expect(mockListUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(request.user.id);
    });

    it('should return the contacts wrapped in a ListContactsResponseDto', async () => {
      const contacts = [makeContact('contact-1'), makeContact('contact-2')];
      mockListUseCase.execute.mockResolvedValueOnce(contacts);

      const result = await controller.list(makeRequest());

      expect(result).toEqual(ListContactsResponseDto.fromEntities(contacts));
    });
  });
});
