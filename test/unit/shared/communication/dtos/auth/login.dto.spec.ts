import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '@shared/communication/dtos/auth/login.dto';

const makeValidPlain = () => ({
  email: 'john.lennon@example.com',
  password: 'Password1',
});

const toDto = (plain: object) => plainToInstance(LoginDto, plain);

describe('LoginDto', () => {
  it('should pass validation with all valid required fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
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

  it('should fail when password is missing', async () => {
    const { password, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password is empty', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), password: '' }));
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
