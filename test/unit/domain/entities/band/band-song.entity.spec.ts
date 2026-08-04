import { BandSongEntity } from '@domain/entities/band/band-song.entity';

const makeProps = () => ({
  band_id: 'band-uuid',
  title: 'Come As You Are',
});

describe('BandSongEntity', () => {
  it('should assign required fields from props', () => {
    const props = makeProps();
    const bandSong = new BandSongEntity(props);

    expect(bandSong.band_id).toBe(props.band_id);
    expect(bandSong.title).toBe(props.title);
  });

  it('should generate id, created_at, and updated_at from BaseEntity', () => {
    const bandSong = new BandSongEntity(makeProps());

    expect(bandSong.id).toBeDefined();
    expect(bandSong.id).toHaveLength(36);
    expect(bandSong.created_at).toBeInstanceOf(Date);
    expect(bandSong.updated_at).toBeInstanceOf(Date);
  });

  it('should assign optional fields when provided', () => {
    const bandSong = new BandSongEntity({
      ...makeProps(),
      tuning: 'Drop D',
      tonality: 'E Minor',
      bpm: 120,
      duration: 219,
      lyrics: 'Letra da música...',
      notes: 'Tocar mais devagar no refrão',
    });

    expect(bandSong.tuning).toBe('Drop D');
    expect(bandSong.tonality).toBe('E Minor');
    expect(bandSong.bpm).toBe(120);
    expect(bandSong.duration).toBe(219);
    expect(bandSong.lyrics).toBe('Letra da música...');
    expect(bandSong.notes).toBe('Tocar mais devagar no refrão');
  });

  it('should leave optional fields undefined when not provided', () => {
    const bandSong = new BandSongEntity(makeProps());

    expect(bandSong.tuning).toBeUndefined();
    expect(bandSong.tonality).toBeUndefined();
    expect(bandSong.bpm).toBeUndefined();
    expect(bandSong.duration).toBeUndefined();
    expect(bandSong.lyrics).toBeUndefined();
    expect(bandSong.notes).toBeUndefined();
  });

  it('should generate unique id for each instance', () => {
    const bandSong1 = new BandSongEntity(makeProps());
    const bandSong2 = new BandSongEntity(makeProps());

    expect(bandSong1.id).not.toBe(bandSong2.id);
  });
});
