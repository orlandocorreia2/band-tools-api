import { UserEntity } from '@domain/entities/user/user.entity';
import {
  IUserRepository,
  UserFilter,
} from '@domain/repositories/user/user.repository.interface';
import { InMemoryStore } from '../in-memory-store';

export class InMemoryUserRepository implements IUserRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(user: UserEntity): Promise<void> {
    this.store.users.add(user);
    return Promise.resolve();
  }

  findBy(filter: UserFilter): Promise<UserEntity | null> {
    const user = this.store.users.findOne((candidate) =>
      Object.entries(filter).every(
        ([field, value]) => candidate[field as keyof UserFilter] === value,
      ),
    );
    return Promise.resolve(user);
  }
}
