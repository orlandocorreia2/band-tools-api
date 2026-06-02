import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { BandGenreEnum } from '@shared/commons/enums/band.enum';

const makeValidPlain = () => ({
  name: 'The Beatles',
  genre: BandGenreEnum.Rock,
  country: 'UK',
  state: 'England',
  city: 'Liverpool',
  neighborhood: 'Woolton',
  address: '251 Menlove Avenue',
  started_at: new Date('1960-01-01'),
});

const toDto = (plain: object) => plainToInstance(CreateBandDto, plain);

describe('CreateBandDto', () => {
  it('should pass validation with all valid required fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is missing', async () => {
    const { name, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail when name is shorter than 3 characters', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), name: 'AB' }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail when genre is missing', async () => {
    const { genre, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'genre')).toBe(true);
  });

  it('should fail when genre is invalid enum value', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), genre: 'invalid_genre' }),
    );
    expect(errors.some((e) => e.property === 'genre')).toBe(true);
  });

  it('should fail when country is missing', async () => {
    const { country, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'country')).toBe(true);
  });

  it('should fail when started_at is not a valid date', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), started_at: 'not-a-date' }),
    );
    expect(errors.some((e) => e.property === 'started_at')).toBe(true);
  });

  it('should pass with optional fields provided', async () => {
    const errors = await validate(
      toDto({
        ...makeValidPlain(),
        description: 'A legend',
        image: 'https://img.com/x.jpg',
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should pass without optional fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });
});
