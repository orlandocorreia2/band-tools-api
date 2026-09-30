import { BandBookingResponseDto } from '@shared/communication/dtos/band/band-booking-response.dto';
import { BandBookingContactResponseDto } from '@shared/communication/dtos/band/band-booking-contact-response.dto';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';

const makeContact = (): ContactEntity =>
  new ContactEntity({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
  });

const makeFullBandBooking = (): BandBookingEntity =>
  new BandBookingEntity({
    id: 'booking-uuid',
    band_id: 'band-uuid',
    title: 'Show Bar do Zé',
    contact_id: 'contact-uuid',
    date: new Date('2026-12-20T00:00:00.000Z'),
    start_time: '22:00',
    duration: '1 hora',
    fee: 800.5,
    consumption: 'Consumação mínima de R$ 50,00 por pessoa',
    link: 'https://instagram.com/bardoze',
    note: 'Levar equipamento de som próprio',
  });

const makeMinimalBandBooking = (): BandBookingEntity =>
  new BandBookingEntity({
    id: 'booking-uuid',
    band_id: 'band-uuid',
    title: 'Show Bar do Zé',
    contact_id: 'contact-uuid',
    date: new Date('2026-01-05T00:00:00.000Z'),
    start_time: '09:30',
    duration: '40 minutos',
    fee: 0,
  });

describe('BandBookingResponseDto', () => {
  describe('fromEntity', () => {
    it('should map all booking fields and nest the contact', () => {
      const bandBooking = makeFullBandBooking();
      const contact = makeContact();

      const dto = BandBookingResponseDto.fromEntity({ bandBooking, contact });

      expect(dto).toEqual({
        id: 'booking-uuid',
        title: 'Show Bar do Zé',
        date: '2026-12-20',
        start_time: '22:00',
        duration: '1 hora',
        fee: 800.5,
        status: BandBookingStatusEnum.Pending,
        consumption: 'Consumação mínima de R$ 50,00 por pessoa',
        link: 'https://instagram.com/bardoze',
        note: 'Levar equipamento de som próprio',
        created_at: bandBooking.created_at,
        updated_at: bandBooking.updated_at,
        contact: BandBookingContactResponseDto.fromEntity(contact),
      });
    });

    it('should not expose band_id nor contact_id, which are redundant', () => {
      const dto = BandBookingResponseDto.fromEntity({
        bandBooking: makeFullBandBooking(),
        contact: makeContact(),
      });

      expect(dto).not.toHaveProperty('band_id');
      expect(dto).not.toHaveProperty('contact_id');
    });

    it('should nest the contact as BandBookingContactResponseDto', () => {
      const dto = BandBookingResponseDto.fromEntity({
        bandBooking: makeFullBandBooking(),
        contact: makeContact(),
      });

      expect(dto.contact).toBeInstanceOf(BandBookingContactResponseDto);
    });

    it('should return null for optional fields that are not filled', () => {
      const dto = BandBookingResponseDto.fromEntity({
        bandBooking: makeMinimalBandBooking(),
        contact: makeContact(),
      });

      expect(dto.consumption).toBeNull();
      expect(dto.link).toBeNull();
      expect(dto.note).toBeNull();
      expect(dto.date).toBe('2026-01-05');
      expect(dto.fee).toBe(0);
    });

    it('should keep the persisted status instead of normalizing it', () => {
      const bandBooking = {
        ...makeMinimalBandBooking(),
        status: BandBookingStatusEnum.Confirmed,
      } as BandBookingEntity;

      const dto = BandBookingResponseDto.fromEntity({
        bandBooking,
        contact: makeContact(),
      });

      expect(dto.status).toBe(BandBookingStatusEnum.Confirmed);
    });
  });

  describe('fromEntities', () => {
    it('should map a list of pairs to a list of BandBookingResponseDto', () => {
      const pair = {
        bandBooking: makeFullBandBooking(),
        contact: makeContact(),
      };

      const dtos = BandBookingResponseDto.fromEntities([pair, pair]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toBeInstanceOf(BandBookingResponseDto);
    });

    it('should return an empty list when given no pairs', () => {
      expect(BandBookingResponseDto.fromEntities([])).toEqual([]);
    });
  });
});
