import { UserEntity } from '@domain/entities/user/user.entity';

const makeProps = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: 'john.lennon@example.com',
  phone: '11912345678',
  password: 'hashed-password',
});

describe('UserEntity', () => {
  it('should assign all required fields from props', () => {
    const props = makeProps();
    const user = new UserEntity(props);

    expect(user.first_name).toBe(props.first_name);
    expect(user.last_name).toBe(props.last_name);
    expect(user.email).toBe(props.email);
    expect(user.phone).toBe(props.phone);
    expect(user.password).toBe(props.password);
  });

  it('should generate id, created_at, and updated_at from BaseEntity', () => {
    const user = new UserEntity(makeProps());

    expect(user.id).toBeDefined();
    expect(user.id).toHaveLength(36);
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeInstanceOf(Date);
  });

  it('should assign optional avatar when provided', () => {
    const user = new UserEntity({
      ...makeProps(),
      avatar: 'https://example.com/avatar.jpg',
    });

    expect(user.avatar).toBe('https://example.com/avatar.jpg');
  });

  it('should leave avatar undefined when not provided', () => {
    const user = new UserEntity(makeProps());

    expect(user.avatar).toBeUndefined();
  });

  it('should generate unique id for each instance', () => {
    const user1 = new UserEntity(makeProps());
    const user2 = new UserEntity(makeProps());

    expect(user1.id).not.toBe(user2.id);
  });
});
