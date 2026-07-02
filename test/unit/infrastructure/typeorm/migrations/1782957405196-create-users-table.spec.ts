import { CreateUsersTable1782957405196 } from '@infrastructure/typeorm/migrations/1782957405196-create-users-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateUsersTable1782957405196', () => {
  let migration: CreateUsersTable1782957405196;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateUsersTable1782957405196();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the users table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "users"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('users');
    });

    it('should pass ifNotExists=true', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [, ifNotExists] = queryRunner.createTable.mock.calls[0];
      expect(ifNotExists).toBe(true);
    });

    it('should include all expected columns', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const columnNames = table.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'first_name',
          'last_name',
          'email',
          'phone',
          'password',
          'avatar',
          'created_at',
          'updated_at',
          'deleted_at',
        ]),
      );
    });

    it('should mark email as unique', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const emailColumn = table.columns.find((c) => c.name === 'email');
      expect(emailColumn?.isUnique).toBe(true);
    });

    it('should set the expected max lengths for variable-size columns', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const lengthOf = (name: string) =>
        table.columns.find((c) => c.name === name)?.length;

      expect(lengthOf('first_name')).toBe('100');
      expect(lengthOf('last_name')).toBe('100');
      expect(lengthOf('email')).toBe('254');
      expect(lengthOf('phone')).toBe('11');
      expect(lengthOf('password')).toBe('60');
    });

    it('should use an unbounded text type for avatar', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const avatarColumn = table.columns.find((c) => c.name === 'avatar');
      expect(avatarColumn?.type).toBe('text');
      expect(avatarColumn?.length).toBeFalsy();
    });
  });

  describe('down', () => {
    it('should drop the users table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('users', true);
    });
  });
});
