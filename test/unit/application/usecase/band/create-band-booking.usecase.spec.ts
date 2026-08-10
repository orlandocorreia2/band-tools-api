import { CreateBandBookingUseCase } from '@usecase/band/create-band-booking.usecase';
import type { CreateBandBookingUseCaseInterface } from '@usecase/band/interfaces';
import { IBandBookingRepository } from '@domain/repositories/band/band-booking.repository.interface';
import { BandBookingEntity } from '@domain/entities/band/band-booking.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';
import { ApplicationUnprocessableEntityException } from '@shared/exceptions/business.exception';

const bandId = 'band-uuid';

const BRAZIL_UTC_OFFSET_HOURS = 3;

// Given an absolute instant, derive the {date, start_time} pair the DTO would carry
// for that instant expressed in Brazil wall-clock time (UTC-3, no DST) — computed
// purely from UTC getters so the test is independent of the test runner's local TZ,
// mirroring exactly how CreateBandBookingUseCase interprets date + start_time.
const toBookingDateTime = (instant: Date) => {
  const brazilWallClock = new Date(
    instant.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  );
  const date = new Date(
    Date.UTC(
      brazilWallClock.getUTCFullYear(),
      brazilWallClock.getUTCMonth(),
      brazilWallClock.getUTCDate(),
    ),
  );
  const start_time = `${String(brazilWallClock.getUTCHours()).padStart(
    2,
    '0',
  )}:${String(brazilWallClock.getUTCMinutes()).padStart(2, '0')}`;

  return { date, start_time };
};

const futureDateTime = () =>
  toBookingDateTime(new Date(Date.now() + 60 * 60 * 1000));

const makeDto = (
  overrides: Partial<CreateBandBookingDto> = {},
): CreateBandBookingDto => {
  const { date, start_time } = futureDateTime();

  return {
    title: 'Show Bar do Zé',
    focal_point_name: 'Maria Souza',
    phone: '11987654321',
    date,
    start_time,
    duration: '1 hora',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    fee: 800,
    ...overrides,
  };
};

describe('CreateBandBookingUseCase', () => {
  let useCase: CreateBandBookingUseCaseInterface;
  let bandBookingRepository: jest.Mocked<IBandBookingRepository>;

  beforeEach(() => {
    bandBookingRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new CreateBandBookingUseCase(bandBookingRepository);
  });

  it('should call bandBookingRepository.save with a BandBookingEntity instance', async () => {
    await useCase.execute(bandId, makeDto());

    expect(bandBookingRepository.save).toHaveBeenCalledTimes(1);
    expect(bandBookingRepository.save).toHaveBeenCalledWith(
      expect.any(BandBookingEntity),
    );
  });

  it('should create BandBookingEntity with the correct required props from dto and bandId', async () => {
    const dto = makeDto();
    await useCase.execute(bandId, dto);

    const saved: BandBookingEntity =
      bandBookingRepository.save.mock.calls[0][0];
    expect(saved.band_id).toBe(bandId);
    expect(saved.title).toBe(dto.title);
    expect(saved.focal_point_name).toBe(dto.focal_point_name);
    expect(saved.phone).toBe(dto.phone);
    expect(saved.date).toBe(dto.date);
    expect(saved.start_time).toBe(dto.start_time);
    expect(saved.duration).toBe(dto.duration);
    expect(saved.address).toBe(dto.address);
    expect(saved.fee).toBe(dto.fee);
  });

  it('should always create BandBookingEntity with status Pending', async () => {
    const dto = makeDto();
    await useCase.execute(bandId, dto);

    const saved: BandBookingEntity =
      bandBookingRepository.save.mock.calls[0][0];
    expect(saved.status).toBe(BandBookingStatusEnum.Pending);
  });

  it('should create BandBookingEntity with optional fields when provided', async () => {
    const dto = makeDto({
      consumption: 'Consumação mínima de R$ 50,00 por pessoa',
      link: 'https://instagram.com/bardoze',
      note: 'Levar equipamento de som próprio',
    });
    await useCase.execute(bandId, dto);

    const saved: BandBookingEntity =
      bandBookingRepository.save.mock.calls[0][0];
    expect(saved.consumption).toBe(dto.consumption);
    expect(saved.link).toBe(dto.link);
    expect(saved.note).toBe(dto.note);
  });

  it('should create BandBookingEntity with fee equal to zero for a free show', async () => {
    const dto = makeDto({ fee: 0 });
    await useCase.execute(bandId, dto);

    const saved: BandBookingEntity =
      bandBookingRepository.save.mock.calls[0][0];
    expect(saved.fee).toBe(0);
  });

  it('should return void', async () => {
    const result = await useCase.execute(bandId, makeDto());

    expect(result).toBeUndefined();
  });

  it('should throw ApplicationUnprocessableEntityException when date is before the current date', async () => {
    const dto = makeDto({
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      start_time: '12:00',
    });

    await expect(useCase.execute(bandId, dto)).rejects.toThrow(
      ApplicationUnprocessableEntityException,
    );
    expect(bandBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ApplicationUnprocessableEntityException when date is today and start_time already passed', async () => {
    const { date, start_time } = toBookingDateTime(
      new Date(Date.now() - 60 * 60 * 1000),
    );
    const dto = makeDto({ date, start_time });

    await expect(useCase.execute(bandId, dto)).rejects.toThrow(
      ApplicationUnprocessableEntityException,
    );
    expect(bandBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should create the booking when date is today and start_time is still future', async () => {
    const { date, start_time } = toBookingDateTime(
      new Date(Date.now() + 5 * 60 * 1000),
    );
    const dto = makeDto({ date, start_time });

    await useCase.execute(bandId, dto);

    expect(bandBookingRepository.save).toHaveBeenCalledTimes(1);
  });
});
