import { ListBandBookingsResponseDto } from '@shared/communication/dtos/band/list-band-bookings-response.dto';
import { BandBookingResponseDto } from '@shared/communication/dtos/band/band-booking-response.dto';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const makePair = (id: string) => ({
  bandBooking: new BandBookingEntity({
    id,
    band_id: 'band-uuid',
    title: 'Show Bar do Zé',
    contact_id: 'contact-uuid',
    date: new Date('2026-12-20T00:00:00.000Z'),
    start_time: '22:00',
    duration: '1 hora',
    fee: 800,
  }),
  contact: new ContactEntity({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    phone: '11987654321',
    venue_name: 'Bar do Zé',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    email: 'contato@bardoze.com',
    role: 'Produtor',
  }),
});

describe('ListBandBookingsResponseDto', () => {
  describe('fromEntities', () => {
    it('should expose the mapped bookings under the data key', () => {
      const pairs = [makePair('booking-1'), makePair('booking-2')];

      const dto = ListBandBookingsResponseDto.fromEntities(pairs);

      expect(dto.data).toEqual(BandBookingResponseDto.fromEntities(pairs));
    });

    it('should expose an empty array under the data key when given no bookings', () => {
      const dto = ListBandBookingsResponseDto.fromEntities([]);

      expect(dto.data).toEqual([]);
    });
  });
});
