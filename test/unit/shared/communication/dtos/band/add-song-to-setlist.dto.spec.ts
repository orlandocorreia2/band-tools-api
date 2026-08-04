import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddSongToSetlistDto } from '@shared/communication/dtos/band/add-song-to-setlist.dto';

const makeValidPlain = () => ({
  bandSongId: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  position: 1,
});

const toDto = (plain: object) => plainToInstance(AddSongToSetlistDto, plain);

describe('AddSongToSetlistDto', () => {
  it('should pass validation with valid fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when bandSongId is missing', async () => {
    const errors = await validate(toDto({ position: 1 }));
    expect(errors.some((e) => e.property === 'bandSongId')).toBe(true);
  });

  it('should fail when bandSongId is not a valid UUID v7', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), bandSongId: 'not-a-uuid' }),
    );
    expect(errors.some((e) => e.property === 'bandSongId')).toBe(true);
  });

  it('should fail when position is missing', async () => {
    const errors = await validate(
      toDto({ bandSongId: makeValidPlain().bandSongId }),
    );
    expect(errors.some((e) => e.property === 'position')).toBe(true);
  });

  it('should fail when position is not an integer', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), position: 'first' }),
    );
    expect(errors.some((e) => e.property === 'position')).toBe(true);
  });

  it('should fail when position is not positive', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), position: -1 }));
    expect(errors.some((e) => e.property === 'position')).toBe(true);
  });
});
