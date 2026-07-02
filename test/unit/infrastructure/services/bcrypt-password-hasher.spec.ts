jest.mock('bcrypt', () => ({
  hash: jest.fn(),
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
});
