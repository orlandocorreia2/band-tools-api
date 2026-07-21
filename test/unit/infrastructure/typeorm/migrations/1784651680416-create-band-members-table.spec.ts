import { CreateBandMembersTable1784651680416 } from '@infrastructure/typeorm/migrations/1784651680416-create-band-members-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateBandMembersTable1784651680416', () => {
  let migration: CreateBandMembersTable1784651680416;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateBandMembersTable1784651680416();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the band_members table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "band_members"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('band_members');
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
          'band_id',
          'user_id',
          'is_owner',
          'created_at',
          'updated_at',
        ]),
      );
    });

    it('should define band_id and user_id as a composite primary key', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const primaryColumns = table.columns
        .filter((c) => c.isPrimary)
        .map((c) => c.name);
      expect(primaryColumns).toEqual(['band_id', 'user_id']);
    });

    it('should default is_owner to false', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const isOwnerColumn = table.columns.find((c) => c.name === 'is_owner');
      expect(isOwnerColumn?.default).toBe(false);
    });

    it('should declare foreign keys to bands and users', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const referencedTables = table.foreignKeys?.map(
        (fk) => fk.referencedTableName,
      );
      expect(referencedTables).toEqual(
        expect.arrayContaining(['bands', 'users']),
      );
    });

    it('should cascade delete when the referenced band or user is deleted', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const onDeleteRules = table.foreignKeys?.map((fk) => fk.onDelete);
      expect(onDeleteRules).toEqual(['CASCADE', 'CASCADE']);
    });

    it('should declare an index on user_id', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const indexColumns = table.indices?.flatMap((i) => i.columnNames);
      expect(indexColumns).toContain('user_id');
    });
  });

  describe('down', () => {
    it('should drop the band_members table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('band_members', true);
    });
  });
});
