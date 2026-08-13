import { ContactController } from '@http/contact/contact.controller';
import type { CreateContactUseCaseInterface } from '@usecase/contact/interfaces/create-contact.usecase.interface';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';

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

describe('ContactController', () => {
  let controller: ContactController;
  let mockCreateUseCase: jest.Mocked<CreateContactUseCaseInterface>;

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    controller = new ContactController(mockCreateUseCase);
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
});
