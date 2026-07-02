import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '@shared/communication/dtos/user/create-user.dto';

const makeValidPlain = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: 'john.lennon@example.com',
  phone: '11912345678',
  password: 'Password1',
});

const toDto = (plain: object) => plainToInstance(CreateUserDto, plain);

describe('CreateUserDto', () => {
  it('should pass validation with all valid required fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when first_name is missing', async () => {
    const { first_name, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'first_name')).toBe(true);
  });

  it('should fail when first_name is shorter than 2 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), first_name: 'J' }),
    );
    expect(errors.some((e) => e.property === 'first_name')).toBe(true);
  });

  it('should fail when last_name is missing', async () => {
    const { last_name, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'last_name')).toBe(true);
  });

  it('should fail when last_name is shorter than 2 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), last_name: 'L' }),
    );
    expect(errors.some((e) => e.property === 'last_name')).toBe(true);
  });

  it('should fail when first_name is longer than 100 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), first_name: 'J'.repeat(101) }),
    );
    expect(errors.some((e) => e.property === 'first_name')).toBe(true);
  });

  it('should fail when last_name is longer than 100 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), last_name: 'L'.repeat(101) }),
    );
    expect(errors.some((e) => e.property === 'last_name')).toBe(true);
  });

  it('should fail when email is missing', async () => {
    const { email, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when email has an invalid format', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), email: 'not-an-email' }),
    );
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when email is longer than 254 characters', async () => {
    const longLocalPart = 'a'.repeat(250);
    const errors = await validate(
      toDto({ ...makeValidPlain(), email: `${longLocalPart}@example.com` }),
    );
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when phone is missing', async () => {
    const { phone, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when phone is shorter than 8 characters', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), phone: '123' }));
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when phone is longer than 11 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), phone: '+5511912345678' }),
    );
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when password is missing', async () => {
    const { password, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password is shorter than 8 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), password: 'Pas1' }),
    );
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password has no letters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), password: '12345678' }),
    );
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password has no numbers', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), password: 'Password' }),
    );
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password is longer than 72 characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), password: `Password1${'a'.repeat(70)}` }),
    );
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
