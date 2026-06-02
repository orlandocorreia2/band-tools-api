import { BandEntity } from '@domain/entities/band/band.entity';
import { BandGenreEnum, BandStatusEnum } from '@shared/commons/enums/band.enum';

const makeProps = () => ({
  name: 'The Beatles',
  genre: BandGenreEnum.Rock,
  country: 'UK',
  state: 'England',
  city: 'Liverpool',
  neighborhood: 'Woolton',
  address: '251 Menlove Avenue',
  started_at: new Date('1960-01-01'),
  status: BandStatusEnum.Active,
});

describe('BandEntity', () => {
  it('should assign all required fields from props', () => {
    const props = makeProps();
    const band = new BandEntity(props);

    expect(band.name).toBe(props.name);
    expect(band.genre).toBe(props.genre);
    expect(band.country).toBe(props.country);
    expect(band.state).toBe(props.state);
    expect(band.city).toBe(props.city);
    expect(band.neighborhood).toBe(props.neighborhood);
    expect(band.address).toBe(props.address);
    expect(band.started_at).toBe(props.started_at);
    expect(band.status).toBe(props.status);
  });

  it('should generate id, created_at, and updated_at from BaseEntity', () => {
    const band = new BandEntity(makeProps());

    expect(band.id).toBeDefined();
    expect(band.id).toHaveLength(36);
    expect(band.created_at).toBeInstanceOf(Date);
    expect(band.updated_at).toBeInstanceOf(Date);
  });

  it('should assign optional fields when provided', () => {
    const band = new BandEntity({
      ...makeProps(),
      description: 'A legendary band',
      image: 'https://example.com/image.jpg',
    });

    expect(band.description).toBe('A legendary band');
    expect(band.image).toBe('https://example.com/image.jpg');
  });

  it('should leave optional fields undefined when not provided', () => {
    const band = new BandEntity(makeProps());

    expect(band.description).toBeUndefined();
    expect(band.image).toBeUndefined();
  });

  it('should generate unique id for each instance', () => {
    const band1 = new BandEntity(makeProps());
    const band2 = new BandEntity(makeProps());

    expect(band1.id).not.toBe(band2.id);
  });
});
