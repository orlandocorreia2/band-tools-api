export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
}
