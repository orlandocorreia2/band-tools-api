import { CreateUserContactsTable1786580209116 } from '@infrastructure/typeorm/migrations/1786580209116-create-user-contacts-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateUserContactsTable1786580209116', () => {
  let migration: CreateUserContactsTable1786580209116;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateUserContactsTable1786580209116();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the user_contacts table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "user_contacts"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('user_contacts');
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
          'user_id',
          'name',
          'phone',
          'alternate_phone',
          'venue_name',
          'address',
          'email',
          'role',
          'notes',
          'created_at',
          'updated_at',
        ]),
      );
    });

    it('should define id as the primary key', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const primaryColumns = table.columns
        .filter((c) => c.isPrimary)
        .map((c) => c.name);
      expect(primaryColumns).toEqual(['id']);
    });

    it('should make the required fields non-nullable', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const requiredColumns = [
        'user_id',
        'name',
        'phone',
        'venue_name',
        'address',
        'email',
        'role',
      ];
      requiredColumns.forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.isNullable).toBe(false);
      });
    });

    it('should make alternate_phone and notes nullable', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      ['alternate_phone', 'notes'].forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.isNullable).toBe(true);
      });
    });

    it('should limit phone and alternate_phone to 11 characters', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      ['phone', 'alternate_phone'].forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.length).toBe('11');
      });
    });

    it('should limit email to 254 characters', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const emailColumn = table.columns.find((c) => c.name === 'email');
      expect(emailColumn?.length).toBe('254');
    });

    it('should declare a foreign key to users with CASCADE on delete', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const [fk] = table.foreignKeys ?? [];
      expect(fk?.columnNames).toEqual(['user_id']);
      expect(fk?.referencedTableName).toBe('users');
      expect(fk?.onDelete).toBe('CASCADE');
    });

    it('should declare an index on user_id', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const indexColumns = table.indices?.flatMap((i) => i.columnNames);
      expect(indexColumns).toContain('user_id');
    });
  });

  describe('down', () => {
    it('should drop the user_contacts table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('user_contacts', true);
    });
  });
});
