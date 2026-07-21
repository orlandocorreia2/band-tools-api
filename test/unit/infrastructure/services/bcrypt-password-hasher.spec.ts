jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { BcryptPasswordHasher } from '@infrastructure/services/bcrypt-password-hasher';
import { EnvConfigService } from '@shared/config/env-config.service';

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;
  let envConfigService: Pick<EnvConfigService, 'bcryptSaltRounds'>;

  beforeEach(() => {
    jest.clearAllMocks();
    envConfigService = { bcryptSaltRounds: 10 };
    hasher = new BcryptPasswordHasher(envConfigService as EnvConfigService);
  });

  it('should be defined', () => {
    expect(hasher).toBeDefined();
  });

  it('should call bcrypt.hash with the plain password and the configured salt rounds', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');
    envConfigService.bcryptSaltRounds = 12;

    await hasher.hash('Password1');

    expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 12);
  });

  it('should return the hash produced by bcrypt', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');

    const result = await hasher.hash('Password1');

    expect(result).toBe('hashed-value');
  });

  it('should call bcrypt.compare with the plain password and the stored hash', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await hasher.compare('Password1', 'hashed-value');

    expect(bcrypt.compare).toHaveBeenCalledWith('Password1', 'hashed-value');
  });

  it('should return true when bcrypt.compare matches', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await hasher.compare('Password1', 'hashed-value');

    expect(result).toBe(true);
  });

  it('should return false when bcrypt.compare does not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await hasher.compare('WrongPassword', 'hashed-value');

    expect(result).toBe(false);
  });
});
