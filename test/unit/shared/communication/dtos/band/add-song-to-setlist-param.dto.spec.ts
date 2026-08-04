import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddSongToSetlistParamDto } from '@shared/communication/dtos/band/add-song-to-setlist-param.dto';

const makeValidPlain = () => ({
  id: '019a2635-cc34-745e-8d67-f0247e2dcba6',
  setlistId: '019a2635-cc34-745e-8d67-f0247e2dcba7',
});

const toDto = (plain: object) =>
  plainToInstance(AddSongToSetlistParamDto, plain);

describe('AddSongToSetlistParamDto', () => {
  it('should pass validation with valid UUID v7 params', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when id is not a valid UUID v7', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), id: 'not-a-uuid' }),
    );
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });

  it('should fail when setlistId is not a valid UUID v7', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), setlistId: 'not-a-uuid' }),
    );
    expect(errors.some((e) => e.property === 'setlistId')).toBe(true);
  });
});
