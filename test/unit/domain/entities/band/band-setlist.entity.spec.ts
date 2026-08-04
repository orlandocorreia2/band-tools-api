import { BandSetlistEntity } from '@domain/entities/band/band-setlist.entity';

const makeProps = () => ({
  band_id: 'band-uuid',
  name: 'Show de Sábado',
});

describe('BandSetlistEntity', () => {
  it('should assign required fields from props', () => {
    const props = makeProps();
    const bandSetlist = new BandSetlistEntity(props);

    expect(bandSetlist.band_id).toBe(props.band_id);
    expect(bandSetlist.name).toBe(props.name);
  });

  it('should generate id, created_at, and updated_at from BaseEntity', () => {
    const bandSetlist = new BandSetlistEntity(makeProps());

    expect(bandSetlist.id).toBeDefined();
    expect(bandSetlist.id).toHaveLength(36);
    expect(bandSetlist.created_at).toBeInstanceOf(Date);
    expect(bandSetlist.updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique id for each instance', () => {
    const bandSetlist1 = new BandSetlistEntity(makeProps());
    const bandSetlist2 = new BandSetlistEntity(makeProps());

    expect(bandSetlist1.id).not.toBe(bandSetlist2.id);
  });
});
