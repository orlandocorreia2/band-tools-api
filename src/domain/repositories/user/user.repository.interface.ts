import { UserEntity } from '@domain/entities/user/user.entity';

export type UserFilter = {
  id?: string;
  email?: string;
};

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findBy(filter: UserFilter): Promise<UserEntity | null>;
}
