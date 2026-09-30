import { BandBookingContactResponseDto } from '@shared/communication/dtos/band/band-booking-contact-response.dto';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makeContact = (
  overrides: Partial<ConstructorParameters<typeof ContactEntity>[0]> = {},
): ContactEntity =>
  new ContactEntity({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
    ...overrides,
  });

describe('BandBookingContactResponseDto', () => {
  describe('fromEntity', () => {
    it('should map only the contact fields needed by the booking', () => {
      const contact = makeContact({
        alternate_phone: '1133654321',
        notes: 'Prefere contato via WhatsApp',
      });

      const dto = BandBookingContactResponseDto.fromEntity(contact);

      expect(dto).toEqual({
        id: 'contact-uuid',
        name: 'Maria Souza',
        phone: '11987654321',
        alternate_phone: '1133654321',
        venue_name: 'Bar do Zé',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        email: 'contato@bardoze.com',
        role: 'Produtor',
        notes: 'Prefere contato via WhatsApp',
      });
    });

    it('should not expose user_id, created_at nor updated_at', () => {
      const dto = BandBookingContactResponseDto.fromEntity(makeContact());

      expect(dto).not.toHaveProperty('user_id');
      expect(dto).not.toHaveProperty('created_at');
      expect(dto).not.toHaveProperty('updated_at');
    });

    it('should return null for optional fields that are not filled', () => {
      const dto = BandBookingContactResponseDto.fromEntity(makeContact());

      expect(dto.alternate_phone).toBeNull();
      expect(dto.notes).toBeNull();
    });
  });
});
