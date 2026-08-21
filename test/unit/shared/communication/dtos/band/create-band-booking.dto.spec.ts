import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBandBookingDto } from '@shared/communication/dtos/band/create-band-booking.dto';

const makeValidPlain = () => ({
  title: 'Show Bar do Zé',
  contact_id: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  date: new Date('2026-09-12'),
  start_time: '22:00',
  duration: '1 hora',
  fee: 800,
});

const toDto = (plain: object) => plainToInstance(CreateBandBookingDto, plain);

describe('CreateBandBookingDto', () => {
  it('should pass validation with all valid required fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is missing', async () => {
    const { title, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail when contact_id is missing', async () => {
    const { contact_id, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'contact_id')).toBe(true);
  });

  it('should fail when contact_id is not a valid UUID', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), contact_id: 'not-a-uuid' }),
    );
    expect(errors.some((e) => e.property === 'contact_id')).toBe(true);
  });

  it('should fail when duration is missing', async () => {
    const { duration, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('should fail when date is not a valid date', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), date: 'not-a-date' }),
    );
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail when start_time is missing', async () => {
    const { start_time, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'start_time')).toBe(true);
  });

  it('should fail when start_time is not in HH:mm format', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), start_time: '25:99' }),
    );
    expect(errors.some((e) => e.property === 'start_time')).toBe(true);
  });

  it('should fail when fee is missing', async () => {
    const { fee, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'fee')).toBe(true);
  });

  it('should fail when fee is negative', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), fee: -1 }));
    expect(errors.some((e) => e.property === 'fee')).toBe(true);
  });

  it('should pass when fee is zero', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), fee: 0 }));
    expect(errors).toHaveLength(0);
  });

  it('should pass when fee is at the maximum supported by numeric(10,2)', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), fee: 99999999.99 }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should fail when fee exceeds the numeric(10,2) column capacity', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), fee: 10000000000 }),
    );
    expect(errors.some((e) => e.property === 'fee')).toBe(true);
  });

  it('should fail when fee has more than 2 decimal places', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), fee: 800.999 }));
    expect(errors.some((e) => e.property === 'fee')).toBe(true);
  });

  it('should pass when fee has exactly 2 decimal places', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), fee: 800.99 }));
    expect(errors).toHaveLength(0);
  });

  it('should fail when link is not a valid URL', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), link: 'not-a-url' }),
    );
    expect(errors.some((e) => e.property === 'link')).toBe(true);
  });

  it('should pass with optional fields provided', async () => {
    const errors = await validate(
      toDto({
        ...makeValidPlain(),
        consumption: 'Consumação mínima de R$ 50,00 por pessoa',
        link: 'https://instagram.com/bardoze',
        note: 'Levar equipamento de som próprio',
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should pass without optional fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should strip a status field sent by the client when whitelist validation runs', async () => {
    const dto: CreateBandBookingDto & { status?: string } = toDto({
      ...makeValidPlain(),
      status: 'Confirmed',
    });
    await validate(dto, { whitelist: true });
    expect(dto.status).toBeUndefined();
  });
});
