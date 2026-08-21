import { ContactResponseDto } from '@shared/communication/dtos/contact/contact-response.dto';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makeContact = (): ContactEntity =>
  new ContactEntity({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    alternate_phone: '1133654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
    notes: 'Prefere contato via WhatsApp',
  });

describe('ContactResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all fields from a ContactEntity', () => {
      const contact = makeContact();

      const dto = ContactResponseDto.fromEntity(contact);

      expect(dto).toEqual({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        alternate_phone: contact.alternate_phone,
        venue_name: contact.venue_name,
        address: contact.address,
        email: contact.email,
        role: contact.role,
        notes: contact.notes,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
      });
    });
  });

  describe('fromEntities', () => {
    it('should map a list of ContactEntity to a list of ContactResponseDto', () => {
      const contacts = [makeContact(), makeContact()];

      const dtos = ContactResponseDto.fromEntities(contacts);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(ContactResponseDto);
    });

    it('should return an empty array when given an empty list', () => {
      expect(ContactResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
