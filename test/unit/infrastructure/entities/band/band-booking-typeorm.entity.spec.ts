import {
  dateColumnTransformer,
  feeColumnTransformer,
} from '@infrastructure/entities/band/band-booking-typeorm.entity';

describe('feeColumnTransformer', () => {
  it('should pass the number through unchanged when writing to the database', () => {
    expect(feeColumnTransformer.to(800)).toBe(800);
  });

  it('should parse the numeric string returned by the database into a number', () => {
    expect(feeColumnTransformer.from('800.00')).toBe(800);
  });
});

describe('dateColumnTransformer', () => {
  it('should serialize a UTC-midnight Date to its YYYY-MM-DD string using UTC getters', () => {
    const value = new Date('2026-08-07T00:00:00.000Z');
    expect(dateColumnTransformer.to(value)).toBe('2026-08-07');
  });

  it('should pad single-digit month and day when serializing', () => {
    const value = new Date('2026-01-05T00:00:00.000Z');
    expect(dateColumnTransformer.to(value)).toBe('2026-01-05');
  });

  it('should not shift the calendar day when serializing regardless of time-of-day noise', () => {
    // Even if a Date carries a non-midnight UTC time, only the calendar day matters here.
    const value = new Date('2026-08-07T23:59:59.999Z');
    expect(dateColumnTransformer.to(value)).toBe('2026-08-07');
  });

  it('should rebuild a UTC-midnight Date from the YYYY-MM-DD string TypeORM normalizes the raw driver value to', () => {
    const result = dateColumnTransformer.from('2026-08-07');
    expect(result.toISOString()).toBe('2026-08-07T00:00:00.000Z');
  });
});
