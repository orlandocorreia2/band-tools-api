import { BandMemberEntity } from '@domain/entities/band-member/band-member.entity';

const makeProps = () => ({
  band_id: 'band-uuid',
  user_id: 'user-uuid',
});

describe('BandMemberEntity', () => {
  it('should assign band_id and user_id from props', () => {
    const props = makeProps();
    const bandMember = new BandMemberEntity(props);

    expect(bandMember.band_id).toBe(props.band_id);
    expect(bandMember.user_id).toBe(props.user_id);
  });

  it('should default is_owner to false when not provided', () => {
    const bandMember = new BandMemberEntity(makeProps());

    expect(bandMember.is_owner).toBe(false);
  });

  it('should assign is_owner when provided', () => {
    const bandMember = new BandMemberEntity({
      ...makeProps(),
      is_owner: true,
    });

    expect(bandMember.is_owner).toBe(true);
  });

  it('should generate created_at and updated_at when not provided', () => {
    const bandMember = new BandMemberEntity(makeProps());

    expect(bandMember.created_at).toBeInstanceOf(Date);
    expect(bandMember.updated_at).toBeInstanceOf(Date);
  });

  it('should assign created_at and updated_at when provided', () => {
    const created_at = new Date('2026-01-01');
    const updated_at = new Date('2026-01-02');
    const bandMember = new BandMemberEntity({
      ...makeProps(),
      created_at,
      updated_at,
    });

    expect(bandMember.created_at).toBe(created_at);
    expect(bandMember.updated_at).toBe(updated_at);
  });
});
