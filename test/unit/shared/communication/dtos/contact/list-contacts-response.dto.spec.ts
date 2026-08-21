import { ListContactsResponseDto } from '@shared/communication/dtos/contact/list-contacts-response.dto';
import { ContactResponseDto } from '@shared/communication/dtos/contact/contact-response.dto';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makeContact = (id: string): ContactEntity =>
  new ContactEntity({
    id,
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
  });

describe('ListContactsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped contacts under the data key', () => {
      const contacts = [makeContact('contact-1'), makeContact('contact-2')];

      const dto = ListContactsResponseDto.fromEntities(contacts);

      expect(dto.data).toEqual(ContactResponseDto.fromEntities(contacts));
    });

    it('should expose an empty array under the data key when given no contacts', () => {
      const dto = ListContactsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
