import { ListBandBookingsUseCase } from '@usecase/band/list-band-bookings.usecase';
import type { ListBandBookingsUseCaseInterface } from '@usecase/band/interfaces';
import { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { IContactRepository } from '@domain/repositories/contact/contact.repository.interface';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

const bandId = 'band-uuid';

const makeBandBooking = (overrides: Partial<BandBookingEntity> = {}) =>
  ({
    id: 'booking-uuid',
    band_id: bandId,
    title: 'Show Bar do Zé',
    contact_id: 'contact-uuid',
    ...overrides,
  }) as BandBookingEntity;

const makeContact = (overrides: Partial<ContactEntity> = {}) =>
  ({
    id: 'contact-uuid',
    user_id: 'user-uuid',
    name: 'Maria Souza',
    ...overrides,
  }) as ContactEntity;

describe('ListBandBookingsUseCase', () => {
  let useCase: ListBandBookingsUseCaseInterface;
  let bandBookingRepository: jest.Mocked<IBandBookingRepository>;
  let contactRepository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    bandBookingRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByBandId: jest.fn().mockResolvedValue([]),
    };
    contactRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAllByUserId: jest.fn().mockResolvedValue([]),
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
      findAllByIds: jest.fn().mockResolvedValue([]),
    };
    useCase = new ListBandBookingsUseCase(
      bandBookingRepository,
      contactRepository,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fetch the bookings of the given band', async () => {
    await useCase.execute(bandId);

    expect(bandBookingRepository.findAllByBandId).toHaveBeenCalledWith(bandId);
  });

  it('should return an empty list without fetching contacts when the band has no bookings', async () => {
    const result = await useCase.execute(bandId);

    expect(result).toEqual([]);
    expect(contactRepository.findAllByIds).not.toHaveBeenCalled();
  });

  it('should pair each booking with its contact preserving the repository order', async () => {
    const first = makeBandBooking({ id: 'booking-1', contact_id: 'contact-1' });
    const second = makeBandBooking({
      id: 'booking-2',
      contact_id: 'contact-2',
    });
    const firstContact = makeContact({ id: 'contact-1' });
    const secondContact = makeContact({ id: 'contact-2' });
    bandBookingRepository.findAllByBandId.mockResolvedValueOnce([
      first,
      second,
    ]);
    contactRepository.findAllByIds.mockResolvedValueOnce([
      secondContact,
      firstContact,
    ]);

    const result = await useCase.execute(bandId);

    expect(result).toEqual([
      { bandBooking: first, contact: firstContact },
      { bandBooking: second, contact: secondContact },
    ]);
  });

  it('should fetch each contact only once when bookings share a contact', async () => {
    bandBookingRepository.findAllByBandId.mockResolvedValueOnce([
      makeBandBooking({ id: 'booking-1', contact_id: 'contact-1' }),
      makeBandBooking({ id: 'booking-2', contact_id: 'contact-1' }),
      makeBandBooking({ id: 'booking-3', contact_id: 'contact-2' }),
    ]);

    await useCase.execute(bandId);

    expect(contactRepository.findAllByIds).toHaveBeenCalledWith([
      'contact-1',
      'contact-2',
    ]);
  });

  it('should omit a booking whose contact was not found', async () => {
    const withContact = makeBandBooking({
      id: 'booking-1',
      contact_id: 'contact-1',
    });
    const orphan = makeBandBooking({
      id: 'booking-2',
      contact_id: 'missing-contact',
    });
    const contact = makeContact({ id: 'contact-1' });
    bandBookingRepository.findAllByBandId.mockResolvedValueOnce([
      withContact,
      orphan,
    ]);
    contactRepository.findAllByIds.mockResolvedValueOnce([contact]);

    const result = await useCase.execute(bandId);

    expect(result).toEqual([{ bandBooking: withContact, contact }]);
  });
});
