import { BandSetlistSongEntity } from '@domain/entities/band/band-setlist-song.entity';

const makeProps = () => ({
  band_setlist_id: 'setlist-uuid',
  band_song_id: 'song-uuid',
  position: 1,
});

describe('BandSetlistSongEntity', () => {
  it('should assign required fields from props', () => {
    const props = makeProps();
    const bandSetlistSong = new BandSetlistSongEntity(props);

    expect(bandSetlistSong.band_setlist_id).toBe(props.band_setlist_id);
    expect(bandSetlistSong.band_song_id).toBe(props.band_song_id);
    expect(bandSetlistSong.position).toBe(props.position);
  });

  it('should generate id, created_at, and updated_at from BaseEntity', () => {
    const bandSetlistSong = new BandSetlistSongEntity(makeProps());

    expect(bandSetlistSong.id).toBeDefined();
    expect(bandSetlistSong.id).toHaveLength(36);
    expect(bandSetlistSong.created_at).toBeInstanceOf(Date);
    expect(bandSetlistSong.updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique id for each instance', () => {
    const bandSetlistSong1 = new BandSetlistSongEntity(makeProps());
    const bandSetlistSong2 = new BandSetlistSongEntity(makeProps());

    expect(bandSetlistSong1.id).not.toBe(bandSetlistSong2.id);
  });
});
