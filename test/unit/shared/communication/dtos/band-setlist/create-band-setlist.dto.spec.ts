import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBandSetlistDto } from '@shared/communication/dtos/band-setlist/create-band-setlist.dto';

const makeValidPlain = () => ({
  name: 'Show de Sábado',
});

const toDto = (plain: object) => plainToInstance(CreateBandSetlistDto, plain);

describe('CreateBandSetlistDto', () => {
  it('should pass validation with the required field', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is missing', async () => {
    const errors = await validate(toDto({}));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail when name is empty', async () => {
    const errors = await validate(toDto({ name: '' }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail when name is not a string', async () => {
    const errors = await validate(toDto({ name: 42 }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
