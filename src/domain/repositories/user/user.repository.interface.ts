import { UserEntity } from '@domain/entities/user/user.entity';

export type UserFilter = {
  email?: string;
};

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findBy(filter: UserFilter): Promise<UserEntity | null>;
}
