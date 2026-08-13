import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContactDto } from '@shared/communication/dtos/contact/create-contact.dto';

const makeValidPlain = () => ({
  name: 'Maria Souza',
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const toDto = (plain: object) => plainToInstance(CreateContactDto, plain);

describe('CreateContactDto', () => {
  it('should pass validation with all valid required fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is missing', async () => {
    const { name, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail when phone is missing', async () => {
    const { phone, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when phone is not a valid Brazilian phone number', async () => {
    const errors = await validate(toDto({ ...makeValidPlain(), phone: '123' }));
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when phone contains formatting characters', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), phone: '(11) 98765-4321' }),
    );
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should pass with a valid fixed-line phone number (10 digits, no mask)', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), phone: '1133654321' }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should fail when phone has more than 11 digits', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), phone: '119876543210' }),
    );
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail when venue_name is missing', async () => {
    const { venue_name, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'venue_name')).toBe(true);
  });

  it('should fail when address is missing', async () => {
    const { address, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'address')).toBe(true);
  });

  it('should fail when email is missing', async () => {
    const { email, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when email is not a valid email address', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), email: 'not-an-email' }),
    );
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when role is missing', async () => {
    const { role, ...rest } = makeValidPlain();
    const errors = await validate(toDto(rest));
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('should fail when alternate_phone is provided but not a valid Brazilian phone number', async () => {
    const errors = await validate(
      toDto({ ...makeValidPlain(), alternate_phone: '123' }),
    );
    expect(errors.some((e) => e.property === 'alternate_phone')).toBe(true);
  });

  it('should pass without optional fields', async () => {
    const errors = await validate(toDto(makeValidPlain()));
    expect(errors).toHaveLength(0);
  });

  it('should pass with optional fields provided', async () => {
    const errors = await validate(
      toDto({
        ...makeValidPlain(),
        alternate_phone: '1133654321',
        notes: 'Prefere contato via WhatsApp',
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
