import { formatDateOnly } from '@shared/helpers/format-date-only';

describe('formatDateOnly', () => {
  it('should format a UTC midnight date as YYYY-MM-DD', () => {
    expect(formatDateOnly(new Date('2026-12-20T00:00:00.000Z'))).toBe(
      '2026-12-20',
    );
  });

  it('should pad month and day with a leading zero', () => {
    expect(formatDateOnly(new Date('2026-01-05T00:00:00.000Z'))).toBe(
      '2026-01-05',
    );
  });

  it('should use UTC getters regardless of the time of day', () => {
    expect(formatDateOnly(new Date('2026-03-09T23:59:59.999Z'))).toBe(
      '2026-03-09',
    );
  });
});
