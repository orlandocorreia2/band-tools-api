import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBandSongDto } from '@shared/communication/dtos/band/create-band-song.dto';

const makeValidPlain = () => ({
  title: 'Come As You Are',
});

const toDto = (plain: object) => plainToInstance(CreateBandSongDto, plain);

describe('CreateBandSongDto', () => {
  it('should pass validation with only the required field', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is missing', async () => {
    const errors = await validate(toDto({}));
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail when title is empty', async () => {
    const errors = await validate(toDto({ title: '' }));
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should pass validation with all fields provided', async () => {
    const errors = await validate(
      toDto({
        ...makeValidPlain(),
        tuning: 'Drop D',
        tonality: 'E Minor',
        bpm: 120,
        duration: 219,
        lyrics: 'Letra da música...',
        notes: 'Tocar mais devagar no refrão',
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should fail when bpm is not an integer', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), bpm: 'fast' }));
    expect(errors.some((e) => e.property === 'bpm')).toBe(true);
  });

  it('should fail when bpm is not positive', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), bpm: -10 }));
    expect(errors.some((e) => e.property === 'bpm')).toBe(true);
  });

  it('should fail when duration is not an integer', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), duration: 'long' }),
    );
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('should fail when duration is not positive', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), duration: -1 }));
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('should fail when tuning is not a string', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), tuning: 42 }));
    expect(errors.some((e) => e.property === 'tuning')).toBe(true);
  });

  it('should fail when tonality is not a string', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), tonality: 42 }));
    expect(errors.some((e) => e.property === 'tonality')).toBe(true);
  });

  it('should fail when lyrics is not a string', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), lyrics: 42 }));
    expect(errors.some((e) => e.property === 'lyrics')).toBe(true);
  });

  it('should fail when notes is not a string', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), notes: 42 }));
    expect(errors.some((e) => e.property === 'notes')).toBe(true);
  });
});
