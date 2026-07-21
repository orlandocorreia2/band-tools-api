import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { EnvConfigService } from '@shared/config/env-config.service';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly envConfigService: EnvConfigService) {}

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.envConfigService.bcryptSaltRounds);
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
