import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@domain/entities/user/user.entity';
import {
  IUserRepository,
  UserFilter,
} from '@domain/repositories/user/user.repository.interface';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly repository: Repository<UserTypeormEntity>,
  ) {}

  async save(user: UserEntity): Promise<void> {
    const entity = this.repository.create(user);

    await this.repository.save(entity);
  }

  async findBy(filter: UserFilter): Promise<UserEntity | null> {
    const found = await this.repository.findOneBy(filter);

    return found;
  }
}
